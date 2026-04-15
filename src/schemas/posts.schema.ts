import { z } from "zod";

// Factory function to create sanitized text schemas with length validation
const createSanitizedTextSchema = (minLength: number, maxLength: number, fieldName: string) =>
  z
    .string()
    .min(minLength, `${fieldName} is required`)
    .max(maxLength, `${fieldName} must not exceed ${maxLength} characters`)
    .trim()
    .transform((val) => {
      return val.replace(/<[^>]*>/g, "");
    });

export const createPostSchema = z.object({
  body: z.object({
    title: createSanitizedTextSchema(1, 200, "Title"),
    content: createSanitizedTextSchema(1, 5000, "Content"),
  }),
});

export const updatePostSchema = z.object({
  params: z.object({
    id: z.string().regex(/^\d+$/, "Invalid post ID").transform(Number),
  }),
  body: z
    .object({
      title: createSanitizedTextSchema(1, 200, "Title").optional(),
      content: createSanitizedTextSchema(1, 5000, "Content").optional(),
    })
    .refine((data) => data.title !== undefined || data.content !== undefined, {
      message: "At least one field (title or content) must be provided",
    }),
});

export const getPostSchema = z.object({
  params: z.object({
    id: z.string().regex(/^\d+$/, "Invalid post ID").transform(Number),
  }),
});

export const deletePostSchema = z.object({
  params: z.object({
    id: z.string().regex(/^\d+$/, "Invalid post ID").transform(Number),
  }),
});

export const getPostsSchema = z.object({
  query: z.object({
    author_id: z
      .string()
      .regex(/^\d+$/, "Invalid author ID")
      .transform(Number)
      .optional(),
    limit: z
      .string()
      .optional()
      .default("20")
      .pipe(
        z
          .string()
          .regex(/^\d+$/, "Invalid limit")
          .transform(Number)
          .refine((val) => val >= 1 && val <= 100, {
            message: "Limit must be between 1 and 100",
          }),
      ),
    offset: z
      .string()
      .optional()
      .default("0")
      .pipe(
        z
          .string()
          .regex(/^\d+$/, "Invalid offset")
          .transform(Number)
          .refine((val) => val >= 0, {
            message: "Offset must be 0 or greater",
          }),
      ),
  }),
});

export const getPostFeedSchema = z.object({
  query: z.object({
    limit: z
      .string()
      .optional()
      .default("20")
      .pipe(
        z
          .string()
          .regex(/^\d+$/, "Invalid limit")
          .transform(Number)
          .refine((val) => val >= 1 && val <= 100, {
            message: "Limit must be between 1 and 100",
          }),
      ),
    offset: z
      .string()
      .optional()
      .default("0")
      .pipe(
        z
          .string()
          .regex(/^\d+$/, "Invalid offset")
          .transform(Number)
          .refine((val) => val >= 0, {
            message: "Offset must be 0 or greater",
          }),
      ),
  }),
});

export const getPostLikesSchema = z.object({
  params: z.object({
    id: z.string().regex(/^\d+$/, "Invalid post ID").transform(Number),
  }),
});

export type CreatePostInput = z.infer<typeof createPostSchema>["body"];
export type UpdatePostInput = z.infer<typeof updatePostSchema>["body"];
