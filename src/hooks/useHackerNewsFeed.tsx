import { useState, useEffect } from "react";
import axios from "axios";
import { front_page_schema, FrontPageHit } from "../schemas/front_page";

export function usehackerNewsFeed(current_page: number, page_size: number) {
  const [posts, setPosts] = useState<FrontPageHit[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<unknown | null>(null);

  useEffect(() => {
    const fetchPosts = async () => {
      try {
        setLoading(true);
        const response = await axios.get(
          `https://hn.algolia.com/api/v1/search_by_date?tags=story&hitsPerPage=${page_size}&page=${current_page}`
        );

        // Validate the response data against the schema
        const parsedData = front_page_schema.safeParse(response.data);

        //throw that error here
        if (!parsedData.success) {
          throw new Error(
            "Invalid data structure: " + parsedData.error.message
          );
        }

        setPosts(parsedData.data.hits);
      } catch (err) {
        setError("Failed to fetch posts" + err);
      } finally {
        setLoading(false);
      }
    };

    fetchPosts();
  }, [current_page, page_size]);

  return { posts, loading, error };
}
