import { z } from "zod";

export const createLikeSchema = z.object({
  body: z.object({
    post_id: z.number().int().positive("Invalid post ID"),
  }),
});

export const getLikeSchema = z.object({
  params: z.object({
    id: z.string().regex(/^\d+$/, "Invalid like ID").transform(Number),
  }),
});

export const deleteLikeSchema = z.object({
  params: z.object({
    id: z.string().regex(/^\d+$/, "Invalid like ID").transform(Number),
  }),
});

export type CreateLikeInput = z.infer<typeof createLikeSchema>["body"];
