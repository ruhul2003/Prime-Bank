import { z } from "zod";

const emailSchema = z
  .string({ required_error: "Email address is required." })
  .trim()
  .toLowerCase()
  .email("Please enter a valid email address.");

export const registerSchema = z.object({
  name: z
    .string({ required_error: "Full name is required." })
    .trim()
    .min(2, "Name must be at least 2 characters.")
    .max(100, "Name cannot exceed 100 characters."),
  email: emailSchema,
  password: z
    .string({ required_error: "Password is required." })
    .min(6, "Password must be at least 6 characters long.")
    .max(128, "Password cannot exceed 128 characters."),
  phone: z.string().trim().max(30).optional(),
  address: z.string().trim().max(250).optional(),
  accountType: z.enum(["savings", "current", "business"]).optional(),
  initialDeposit: z.coerce.number().min(0, "Initial deposit cannot be negative.").optional(),
  transactionPin: z
    .string()
    .trim()
    .regex(/^[0-9]{4,6}$/, "Transaction PIN must be 4 to 6 digits.")
    .optional(),
});

export const loginSchema = z.object({
  email: emailSchema,
  password: z
    .string({ required_error: "Password is required." })
    .min(1, "Password is required."),
});

export const changePasswordSchema = z
  .object({
    currentPassword: z
      .string({ required_error: "Current password is required." })
      .min(1, "Current password is required."),
    newPassword: z
      .string({ required_error: "New password is required." })
      .min(6, "New password must be at least 6 characters long.")
      .max(128, "New password cannot exceed 128 characters."),
  })
  .refine((data) => data.currentPassword !== data.newPassword, {
    message: "New password must differ from current password.",
    path: ["newPassword"],
  });

export const updateProfileSchema = z.object({
  name: z.string().trim().min(2, "Name must be at least 2 characters.").max(100).optional(),
  phone: z.string().trim().max(30).optional(),
  address: z.string().trim().max(250).optional(),
});

export const refreshTokenSchema = z.object({
  refreshToken: z
    .string({ required_error: "Refresh token is required." })
    .min(1, "Refresh token is required."),
});
