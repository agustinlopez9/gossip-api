import { z } from "zod";

// Sanitized text schema for user input
const sanitizedTextSchema = z
  .string()
  .trim()
  .transform((val) => val.replace(/<[^>]*>/g, ""));

const emailSchema = z
  .string()
  .email("Invalid email address")
  .toLowerCase()
  .transform((val) => val.trim());

export const getUserSchema = z.object({
  params: z.object({
    id: z.string().regex(/^\d+$/, "Invalid user ID").transform(Number),
  }),
});

export const updateUserSchema = z.object({
  params: z.object({
    id: z.string().regex(/^\d+$/, "Invalid user ID").transform(Number),
  }),
  body: z
    .object({
      first_name: sanitizedTextSchema
        .min(1, "First name is required")
        .max(50, "First name must not exceed 50 characters")
        .optional(),
      last_name: sanitizedTextSchema
        .min(1, "Last name is required")
        .max(50, "Last name must not exceed 50 characters")
        .optional(),
      email: emailSchema.optional(),
    })
    .refine(
      (data) =>
        data.first_name !== undefined ||
        data.last_name !== undefined ||
        data.email !== undefined,
      {
        message: "At least one field (first_name, last_name, or email) must be provided",
      },
    ),
});

export const getUserPostsSchema = z.object({
  params: z.object({
    id: z.string().regex(/^\d+$/, "Invalid user ID").transform(Number),
  }),
});

export const getUserFollowersSchema = z.object({
  params: z.object({
    id: z.string().regex(/^\d+$/, "Invalid user ID").transform(Number),
  }),
});

export const getUserFollowingSchema = z.object({
  params: z.object({
    id: z.string().regex(/^\d+$/, "Invalid user ID").transform(Number),
  }),
});
