import { z } from "zod";

export const saved_posts_schema = z.object({
  saved_posts: z.array(
    z.object({
      title: z.string(),
      objectID: z.string(),
    })
  ),
});

export type SavedPost = z.infer<
  typeof saved_posts_schema
>["saved_posts"][number];
