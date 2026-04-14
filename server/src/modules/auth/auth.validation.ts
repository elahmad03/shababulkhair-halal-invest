import { z } from "zod";
import { Request, Response, NextFunction } from "express";
// --- OTP & Purpose ---
const otp = z.string().regex(/^\d{6}$/, "OTP must be exactly 6 digits");
const purpose = z.enum(["EMAIL_VERIFICATION", "PASSWORD_RESET"]);

const registerSchema = z.object({
  firstName: z.string().min(2),
  lastName: z.string().min(2),
  email: z.email(),
  password: z.string().min(8),
  phoneNumber: z.string().min(7),
});


 const LoginSchema = z.object({
  email: z.email(),
  password: z.string().min(6),
  deviceId: z.string().optional(),
  ip: z.string().optional(),
  userAgent: z.string().optional(),
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
export const validateLogin = validate(LoginSchema);
export type OtpPurpose = z.infer<typeof purpose>;