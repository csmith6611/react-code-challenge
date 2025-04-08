import { set } from "zod";
import { usehackerNewsFeed } from "../../hooks/useHackerNewsFeed";
import { Card } from "../display/Card";
import React, { useEffect, useMemo } from "react";

export function NewsFeedScroller() {
  const [loaded_page, set_loaded_page] = React.useState(1);
  const [page_size, set_page_size] = React.useState(20);

  const [visible_page, set_visible_page] = React.useState(1);

  const {
    posts: data,
    error,
    loading,
  } = usehackerNewsFeed(loaded_page, page_size);

  const [cached_posts, set_cached_posts] = React.useState(data);

  useEffect(() => {
    if (data.length > 0) {
      set_cached_posts((prev) => {
        //filter out the posts that are already in the cache

        const new_posts = data.filter(
          (post) => !prev.some((p) => p.objectID === post.objectID)
        );
        return [...prev, ...new_posts];
      });
    }
  }, [data]);

  const bottom_scroll_ref = React.useRef<HTMLDivElement>(null);

  const handleScroll = () => {
    if (bottom_scroll_ref.current) {
      const { bottom } = bottom_scroll_ref.current.getBoundingClientRect();
      const { innerHeight } = window;
      console.log(bottom, innerHeight);
      if (bottom <= innerHeight) {
        //load more data when the bottom of the page is reached
        if (visible_page < loaded_page) {
          set_visible_page((prev) => prev + 1);
        } else if (visible_page === loaded_page) {
          set_loaded_page((prev) => prev + 1);
          set_visible_page((prev) => prev + 1);
        }
      }
    }
  };

  useEffect(() => {
    window.addEventListener("scroll", handleScroll, {
      passive: true,
    });
    return () => {
      window.removeEventListener("scroll", handleScroll);
    };
  }, [loading]);

  return (
    <main className="flex flex-col gap-4 w-3/4 mx-auto mt-4 justify-center items-center">
      {cached_posts &&
        cached_posts?.map((post) => {
          return (
            <Card
              key={post.objectID}
              title={post.title}
              author={post.author}
              points={post.points}
              time={post.updated_at.toString()}
              url={post.url}
            />
          );
        })}
      {loading && (
        <div className="flex justify-center items-center w-full h-16">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
        </div>
      )}
      <div ref={bottom_scroll_ref} className="h-4 w-full">
        _______BOTTOM___________
      </div>
    </main>
  );
}

//todo in this file after scrolling:
// - add a loading spinner while fetching data
// - add a error message if fetching data fails
