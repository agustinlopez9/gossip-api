import { z } from "zod";

export const createFollowerSchema = z.object({
  body: z.object({
    followed_id: z.number().int().positive("Invalid user ID to follow"),
  }),
});

export const getFollowerSchema = z.object({
  params: z.object({
    id: z.string().regex(/^\d+$/, "Invalid follower ID").transform(Number),
  }),
});

export const deleteFollowerSchema = z.object({
  params: z.object({
    id: z.string().regex(/^\d+$/, "Invalid follower ID").transform(Number),
  }),
});

export const checkFollowerSchema = z.object({
  params: z.object({
    userId: z.string().regex(/^\d+$/, "Invalid user ID").transform(Number),
  }),
});

export type CreateFollowerInput = z.infer<typeof createFollowerSchema>["body"];
