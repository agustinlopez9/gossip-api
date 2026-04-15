import { z } from "zod";

// Strong password validation
const passwordSchema = z
  .string()
  .min(8, "Password must be at least 8 characters long")
  .regex(/[a-z]/, "Password must contain at least one lowercase letter")
  .regex(/[A-Z]/, "Password must contain at least one uppercase letter")
  .regex(/[0-9]/, "Password must contain at least one number")
  .regex(/[^a-zA-Z0-9]/, "Password must contain at least one special character");

// Email validation
const emailSchema = z.string().email("Invalid email format").toLowerCase();

// Username validation with sanitization
const usernameSchema = z
  .string()
  .min(3, "Username must be at least 3 characters long")
  .max(30, "Username must not exceed 30 characters")
  .regex(/^[a-zA-Z0-9_]+$/, "Username can only contain letters, numbers, and underscores")
  .trim();

// Name validation with sanitization
const nameSchema = z
  .string()
  .min(1, "Name is required")
  .max(50, "Name must not exceed 50 characters")
  .regex(/^[a-zA-Z\s'-]+$/, "Name can only contain letters, spaces, hyphens, and apostrophes")
  .trim();

export const signupSchema = z.object({
  body: z.object({
    username: usernameSchema,
    email: emailSchema,
    first_name: nameSchema,
    last_name: nameSchema.optional().nullable(),
    password: passwordSchema,
  }),
});

export const loginSchema = z.object({
  body: z.object({
    username: z.string().min(1, "Username is required").trim(),
    password: z.string().min(1, "Password is required"),
  }),
});

export type SignupInput = z.infer<typeof signupSchema>["body"];
export type LoginInput = z.infer<typeof loginSchema>["body"];
