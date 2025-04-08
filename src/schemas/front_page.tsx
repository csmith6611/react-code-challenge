import z from "zod";

export const front_page_schema = z.object({
  hits: z.array(
    z.object({
      num_comments: z.number().optional(),
      title: z.string(),
      objectID: z.string(),
      updated_at: z.string(),
      author: z.string(),
      points: z.number().optional(),
      url: z.string().optional(),
    })
  ),
  hitsPerPage: z.number().optional(),
  page: z.number().optional(),
});

export type FrontPage = z.infer<typeof front_page_schema>;
export type FrontPageHit = z.infer<typeof front_page_schema>["hits"][number];
