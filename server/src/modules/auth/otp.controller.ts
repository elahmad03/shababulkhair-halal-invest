import { Request, Response } from "express";
import { catchAsync } from "../../utils/catchAsync";
import { successResponse } from "../../utils/response";
import { verifyOtp, resendOtp, forgotPassword, resetPassword } from "./auth.services";
import { BadRequestError } from "../../utils/errors";
import { env } from "../../config";

// POST /auth/otp/verify
// Public — userId comes from register/login response, no token needed
export const verifyEmailOTP = catchAsync(async (req: Request, res: Response) => {
  const { userId, otp, purpose } = req.body;

  if (!userId || !otp) throw new BadRequestError("userId and otp are required");

  const result = await verifyOtp(userId, otp, purpose ?? "EMAIL_VERIFICATION");
  
  // If EMAIL_VERIFICATION, set cookies for new session
  if (purpose !== "PASSWORD_RESET" && "user" in result && "accessToken" in result) {
    res
      .cookie("refreshToken", result.refreshToken, {
        httpOnly: true,
        secure: env.NODE_ENV === "production",
        sameSite: "strict",
        maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
      })
      .cookie("userRole", result.user.role, {
        httpOnly: false, // Accessible to middleware/client for routing
        secure: env.NODE_ENV === "production",
        sameSite: "strict",
        maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
      });
  }
  
  res.json(successResponse(result));
});

// POST /auth/otp/resend
// Public — takes email
export const resendOTP = catchAsync(async (req: Request, res: Response) => {
  const { email } = req.body;
  if (!email) throw new BadRequestError("Email is required");

  const result = await resendOtp(email);
  res.json(successResponse(result));
});

// POST /auth/forgot-password
// Public
export const forgotPasswordHandler = catchAsync(async (req: Request, res: Response) => {
  const { email } = req.body;
  if (!email) throw new BadRequestError("Email is required");

  const result = await forgotPassword(email);
  res.json(successResponse(result));
});

// POST /auth/reset-password
// Public — userId from forgot password response
export const resetPasswordHandler = catchAsync(async (req: Request, res: Response) => {
  const { userId, otp, newPassword } = req.body;

  if (!userId || !otp || !newPassword) {
    throw new BadRequestError("userId, otp and newPassword are required");
  }

  const result = await resetPassword(userId, otp, newPassword);
  res.json(successResponse(result));
});