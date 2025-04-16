import React, { JSX, ReactNode, useCallback, useEffect, useMemo } from "react";
import { useHackerNewsFeed } from "../../hooks/useHackerNewsFeed";
import { Card } from "../display/Card";

export function NewsFeedScroller() {
  const [page_size, set_page_size] = React.useState(10);

  const { posts_fetcher } = useHackerNewsFeed(1, page_size);

  return (
    <div className="flex flex-col gap-4 items-center justify-center w-full">
      <HydrationInfiniteScroller
        DisplayComponent={Card}
        fetch_callback={posts_fetcher}
        data_key="objectID"
        page_size={page_size}
        pages_shown={1}
        custom_displays={{
          Loader: <div>Loading...</div>,
          Error: <div>Error</div>,
          Skeleton: <div className="h-48 bg-gray-200 animate-pulse"></div>,
          Unrendered: <div className="h-48 bg-gray-200"></div>,
        }}
      />
    </div>
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

//turn this into a generic component

function HydrationInfiniteScroller<Data, DisplayProps>(props: {
  DisplayComponent: React.FC<DisplayProps>;
  fetch_callback: (page_size: number, page: number) => Promise<Data[]>;
  data_key: string;
  page_size: number;
  pages_shown: number;
  initial_data?: Data[];
  custom_displays: {
    Loader: ReactNode;
    Error: ReactNode;
    Skeleton: ReactNode;
    Unrendered: ReactNode;
  };
}) {
  const {
    fetch_callback: data_fetcher,
    page_size,
    data_key,
    initial_data,
    DisplayComponent,
    custom_displays: { Loader, Error, Skeleton, Unrendered },
  } = props;

  const [loaded_page, set_loaded_page] = React.useState(1);

  const [cached_data, set_cached_data] = React.useState(initial_data ?? []);

  const [loading, set_loading] = React.useState(false);

  const [visible_page_tuple, set_visible_page_tuple] = React.useState([
    -1,
    props.pages_shown ?? 1,
  ]);

  const bottom_scroll_ref = React.useRef<HTMLDivElement>(null);
  const top_scroll_ref = React.useRef<HTMLDivElement>(null);

  const page_components_array: JSX.Element[] = useMemo(() => {
    if (!cached_data) return [];

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
            {Unrendered}
          </div>
        );
        continue;
      }

      if (i > upper_hydration_bound) {
        components.push(
          <div className="h-48" key={i}>
            {Unrendered}
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
          <DisplayComponent
            key={i}
            {...(cached_data[i] as unknown as DisplayProps)}
          />
        );
      } else {
        components.push(
          <div className="h-48" key={i}>
            {Skeleton}
          </div>
        );
      }
    }

    return components;
  }, [
    DisplayComponent,
    Skeleton,
    Unrendered,
    cached_data,
    loaded_page,
    page_size,
    visible_page_tuple,
  ]);

  useEffect(() => {
    const get_data = async () => {
      if (cached_data.length === 0) {
        const posts = await data_fetcher(page_size, loaded_page);
        set_cached_data((prev) => {
          //filter out the posts that are already in the cache

          const new_posts = posts.filter(
            (post) => !prev.some((p) => p[data_key] === post[data_key])
          );
          return [...prev, ...new_posts];
        });
      }
    };

    get_data();
  }, [cached_data, data_fetcher, data_key, loaded_page, page_size]);

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

      set_loading(true);
      //fetch more data here

      const posts = await data_fetcher(page_size, loaded_page + 1);

      set_cached_data((prev) => {
        const new_posts = posts.filter(
          (post) => !prev.some((p) => p[data_key] === post[data_key])
        );
        set_loading(false);
        return [...prev, ...new_posts];
      });
    } else {
      set_visible_page_tuple((prev) => [prev[0] + 1, prev[1] + 1]);
    }
  }, [visible_page_tuple, loaded_page, data_fetcher, page_size, data_key]);

  useIntersectionObserver(bottom_scroll_ref, (entry) => {
    if (entry.isIntersecting) {
      handle_bottom_scroll();
    }
  });

  return (
    <>
      {page_components_array &&
        page_components_array?.map((component, index) => {
          return <React.Fragment key={index}>{component}</React.Fragment>;
        })}

      {loading && <>{Loader}</>}
    </>
  );
}
