import { z } from "zod";

// Sanitized text schema factory for user input
const sanitizedTextSchema = (minLength?: number, maxLength?: number) => {
  let schema = z.string().trim();
  if (minLength !== undefined) {
    schema = schema.min(minLength, `Minimum length is ${minLength}`);
  }
  if (maxLength !== undefined) {
    schema = schema.max(maxLength, `Maximum length is ${maxLength}`);
  }
  return schema.transform((val) => val.replace(/<[^>]*>/g, ""));
};

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
      first_name: sanitizedTextSchema(1, 50).optional(),
      last_name: sanitizedTextSchema(1, 50).optional(),
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
