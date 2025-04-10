import React, { JSX, useCallback, useEffect, useMemo } from "react";
import { useHackerNewsFeed } from "../../hooks/useHackerNewsFeed";
import { Card } from "../display/Card";

export function NewsFeedScroller() {
  const [loaded_page, set_loaded_page] = React.useState(1);
  const [page_size, set_page_size] = React.useState(20);

  const [visible_page_tuple, set_visible_page_tuple] = React.useState([-1, 1]);

  const {
    posts: data,
    error,
    loading,
    posts_fetcher,
  } = useHackerNewsFeed(0, 20);
  const [cached_data, set_cached_data] = React.useState(data);

  const bottom_scroll_ref = React.useRef<HTMLDivElement>(null);
  const top_scroll_ref = React.useRef<HTMLDivElement>(null);

  const page_components_array: JSX.Element[] = useMemo(() => {
    const components: JSX.Element[] = [];

    const lower_hydration_bound = Math.max(
      visible_page_tuple[0] * page_size,
      0
    );
    const upper_hydration_bound = visible_page_tuple[1] * page_size - 1;

    for (let i = 0; i < loaded_page * page_size; i++) {
      if (i < lower_hydration_bound) {
        components.push(
          <div className="h-48" key={i}>
            UNRENDERED
          </div>
        );
        continue;
      }

      if (i > upper_hydration_bound) {
        components.push(
          <div className="h-48" key={i}>
            UNRENDERED
          </div>
        );

        continue;
      }

      if (i === lower_hydration_bound) {
        components.push(
          <div className="h-2" key={i + "ref"} ref={top_scroll_ref}>
            TOP
          </div>
        );
      }

      if (i === upper_hydration_bound) {
        components.push(
          <div className="h-2" key={i + "ref"} ref={bottom_scroll_ref}>
            Bottom
          </div>
        );
      }

      if (cached_data[i]) {
        components.push(
          <Card
            key={i}
            title={cached_data[i].title ?? "ERROR"}
            author={cached_data[i].author ?? "ERROR"}
            points={cached_data[i].points ?? 0}
            time={cached_data[i].updated_at.toString() ?? "ERROR"}
            url={cached_data[i].url ?? "ERROR"}
          />
        );
      } else {
        components.push(
          <div className="h-48" key={i}>
            SKELETON LOADER
          </div>
        );
      }
    }

    return components;
  }, [cached_data, loaded_page, page_size, visible_page_tuple]);

  useEffect(() => {
    if (data.length > 0) {
      set_cached_data((prev) => {
        //filter out the posts that are already in the cache

        const new_posts = data.filter(
          (post) => !prev.some((p) => p.objectID === post.objectID)
        );
        return [...prev, ...new_posts];
      });
    }
  }, [data]);

  const handle_top_scroll = useCallback(() => {
    if (visible_page_tuple[0] > 0) {
      set_visible_page_tuple((prev) => [prev[0] - 1, prev[1] - 1]);
    }
  }, [visible_page_tuple]);

  useIntersectionObserver(top_scroll_ref, (entry) => {
    if (entry.isIntersecting) {
      handle_top_scroll();
    }
  });

  const handle_bottom_scroll = useCallback(async () => {
    console.log("Bottom scroll handler called");
    if (visible_page_tuple[1] === loaded_page) {
      set_visible_page_tuple((prev) => [prev[0] + 1, prev[1] + 1]);
      set_loaded_page(loaded_page + 1);
      //fetch more data here

      const posts = await posts_fetcher(page_size, loaded_page + 1);

      set_cached_data((prev) => {
        const new_posts = posts.filter(
          (post) => !prev.some((p) => p.objectID === post.objectID)
        );
        return [...prev, ...new_posts];
      });
    } else {
      set_visible_page_tuple((prev) => [prev[0] + 1, prev[1] + 1]);
    }
  }, [loaded_page, visible_page_tuple, posts_fetcher, page_size]);

  useIntersectionObserver(bottom_scroll_ref, (entry) => {
    if (entry.isIntersecting) {
      handle_bottom_scroll();
    }
  });

  useIntersectionObserver(top_scroll_ref, (entry) => {
    if (entry.isIntersecting) {
      handle_top_scroll();
    }
  });

  console.log(
    bottom_scroll_ref.current,
    top_scroll_ref.current,
    visible_page_tuple,
    loaded_page
  );

  return (
    <main className="flex flex-col gap-4 w-3/4 mx-auto mt-4 justify-center items-center">
      {page_components_array &&
        page_components_array?.map((component, index) => {
          return <React.Fragment key={index}>{component}</React.Fragment>;
        })}

      {loading && (
        <div className="flex justify-center items-center w-full h-48">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
        </div>
      )}
    </main>
  );
}

//todo in this file after scrolling:
// - add a loading spinner while fetching data
// - add a error message if fetching data fails
function useIntersectionObserver(
  ref: React.RefObject<HTMLElement | null>,
  callback: (entry: IntersectionObserverEntry) => void
) {
  const observer = React.useRef<IntersectionObserver | null>(null);

  useEffect(() => {
    const curr_ref = ref.current;

    if (!curr_ref) return; // Exit if the ref is not set

    // Create a new observer
    observer.current = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        callback(entry);
      });
    });

    // Observe the current element
    observer.current.observe(curr_ref);

    // Cleanup function to unobserve the element and disconnect the observer
    return () => {
      if (observer.current) {
        observer.current.unobserve(curr_ref);
        observer.current.disconnect();
        observer.current = null;
      }
    };
  }, [ref, callback]); // Re-run the effect if `ref` or `callback` changes
}
