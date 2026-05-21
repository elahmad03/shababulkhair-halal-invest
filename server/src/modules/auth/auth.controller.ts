import { NextFunction, Request, Response } from "express";
import { catchAsync } from "../../utils/catchAsync";
import { successResponse } from "../../utils/response";
import * as authService from "./auth.services";
import { env } from "../../config";
import { AuthenticatedRequest } from "../../common/middleware/auth.middleware";
import { validateLogin } from "./auth.validation";

const isProduction = env.NODE_ENV === "production";
const SEVEN_DAYS_SECONDS = 7 * 24 * 60 * 60 * 1000;

const cookieOptions = {
  httpOnly: true,
  secure: isProduction,
  sameSite: (isProduction ? "none" : "lax") as "none" | "lax" | "strict",
  maxAge: SEVEN_DAYS_SECONDS,
};

// POST /auth/register
export const register = catchAsync(async (req: Request, res: Response) => {
  const user = await authService.register(req.body);
  res.status(201).json(successResponse(user, "Account created"));
});

import { z } from "zod";

// -------------------------
// Validation schema
// -------------------------
const LoginSchema = z.object({
  email: z.email(),
  password: z.string().min(1),
});

// POST /auth/login
export const login = catchAsync(async (req: Request, res: Response) => {
  // ✅ validate FIRST
  const parsed = LoginSchema.safeParse(req.body);

  if (!parsed.success) {
    return res.status(400).json({
      success: false,
      message: "Invalid login input",
      errors: parsed.error.flatten(),
    });
  }

  const result = await authService.login({
    ...parsed.data, // ✅ safe guaranteed values
    ip: req.ip,
    userAgent: req.headers["user-agent"],
  });

  if ("needVerification" in result) {
    return res.status(401).json({
      success: false,
      message: result.message,
      needVerification: true,
      userId: result.userId,
    });
  }

  return res
    .cookie("refreshToken", result.refreshToken, {
      ...cookieOptions,
      httpOnly: true,
    })
    .cookie("userRole", result.user.role, {
      ...cookieOptions,
      httpOnly: false,
    })
    .json(
      successResponse(
        {
          user: result.user,
          accessToken: result.accessToken,
        },
        "Login successful"
      )
    );
});
// POST /auth/refresh
export const refresh = catchAsync(async (req: Request, res: Response) => {
  const token = req.cookies?.refreshToken || req.body?.refreshToken;

  if (!token) {
    return res.status(401).json({ success: false, message: "No refresh token provided" });
  }

  // 1. Destructure the tokens AND the user from your updated service
  const { accessToken, refreshToken, user } = await authService.refreshTokens(token);

  res
    .cookie("refreshToken", refreshToken, {
      ...cookieOptions,
      httpOnly: true,
    })
    // 2. Include the user in the JSON response so the frontend can read it!
    .json(successResponse({ accessToken, user }, "Tokens refreshed"));
});
// POST /auth/logout
export const logout = catchAsync(async (req: AuthenticatedRequest, res: Response) => {
  const refreshToken = req.cookies?.refreshToken || req.body?.refreshToken;

  if (!refreshToken) {
    return res.status(400).json({ success: false, message: "No refresh token provided" });
  }

  const { userId, jti: accessJti } = req.user!;

  let decoded: { jti?: string };
  try {
    const payload = refreshToken.split(".")[1];
    if (!payload) throw new Error("Invalid token format");
    decoded = JSON.parse(Buffer.from(payload, "base64url").toString());
  } catch {
    return res.status(400).json({ success: false, message: "Invalid refresh token format" });
  }

  if (!decoded.jti) {
    return res.status(400).json({ success: false, message: "Invalid refresh token: missing jti" });
  }

  await authService.logout(userId, decoded.jti, accessJti);

  res
    .clearCookie("refreshToken", {
      httpOnly: true,
      secure: isProduction,
      sameSite: (isProduction ? "none" : "lax") as "none" | "lax" | "strict",
    })
    .clearCookie("userRole", {
      secure: isProduction,
      sameSite: (isProduction ? "none" : "lax") as "none" | "lax" | "strict",
    })
    .json(successResponse(null, "Logged out successfully"));
});

// POST /auth/logout-all
export const logoutAll = catchAsync(async (req: AuthenticatedRequest, res: Response, _next: NextFunction) => {
  await authService.logoutAll(req.user!.userId);
  res
    .clearCookie("refreshToken", {
      httpOnly: true,
      secure: isProduction,
      sameSite: (isProduction ? "none" : "lax") as "none" | "lax" | "strict",
    })
    .clearCookie("userRole", {
      secure: isProduction,
      sameSite: (isProduction ? "none" : "lax") as "none" | "lax" | "strict",
    })
    .json(successResponse(null, "All sessions terminated"));
});