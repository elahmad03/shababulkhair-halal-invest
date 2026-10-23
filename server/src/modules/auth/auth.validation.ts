import { z } from "zod";
import { Request, Response, NextFunction } from "express";
// --- OTP & Purpose ---
export const otpSchema = z.string().regex(/^\d{6}$/, "OTP must be exactly 6 digits");
export const purposeSchema = z.enum(["EMAIL_VERIFICATION", "PASSWORD_RESET"]);

export const registerSchema = z.object({
  firstName: z.string().min(2, "First name must be at least 2 characters"),
  lastName: z.string().min(2, "Last name must be at least 2 characters"),
  email: z.string().email("Invalid email address"),
  password: z.string().min(8, "Password must be at least 8 characters"),
  phoneNumber: z.string().min(7, "Phone number must be at least 7 digits"),
});

export const loginSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(6, "Password is required"),
  deviceId: z.string().optional(),
  ip: z.string().optional(),
  userAgent: z.string().optional(),
});

export const forgotPasswordSchema = z.object({
  email: z.string().email("Please provide a valid email address"),
});

export const resetPasswordSchema = z
  .object({
    email: z.string().email("Please provide a valid email address").optional(),
    userId: z.string().uuid("Invalid user ID").optional(),
    otp: z.string().regex(/^\d{6}$/, "OTP must be exactly 6 digits"),
    newPassword: z.string().min(8, "Password must be at least 8 characters"),
  })
  .refine((data) => Boolean(data.email || data.userId), {
    message: "Either email or userId is required",
    path: ["email"],
  });

function validate(schema: z.ZodTypeAny) {
  return (req: Request, res: Response, next: NextFunction) => {
    const result = schema.safeParse(req.body);
    if (!result.success) {
      return res.status(400).json({
        success: false,
        message: "Validation failed",
        errors: result.error.flatten().fieldErrors,
      });
    }
    req.body = result.data;
    next();
  };
}

export const validateRegister = validate(registerSchema);
export const validateLogin = validate(loginSchema);
export const LoginSchema = loginSchema;
export type OtpPurpose = z.infer<typeof purposeSchema>;
export type ForgotPasswordInput = z.infer<typeof forgotPasswordSchema>;
export type ResetPasswordInput = z.infer<typeof resetPasswordSchema>;