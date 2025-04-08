import { saved_posts_schema, SavedPost } from "../schemas/saved_posts";

export function usePostsOperations() {
  const getPosts = () => {
    if (typeof window !== "undefined") {
      const storedValue = localStorage.getItem("posts");
      const stored_value = storedValue ? JSON.parse(storedValue) : null;

      if (stored_value) {
        const parsedData = saved_posts_schema.safeParse(stored_value);
        if (parsedData.success) {
          return parsedData.data.saved_posts;
        } else {
          console.error("Invalid data structure: ", parsedData.error.message);
        }
      }
    }
    return null;
  };

  const savePosts = (value: SavedPost) => {
    if (typeof window !== "undefined") {
      const storedValue = getPosts();

      if (storedValue) {
        localStorage.setItem("posts", JSON.stringify([...storedValue, value]));
      } else {
        localStorage.setItem("storage", JSON.stringify([value]));
      }
    }
  };

  return { getPosts, savePosts };
}
