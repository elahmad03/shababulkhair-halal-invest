import crypto from 'node:crypto';
import {prisma} from "../../config/prisma";
import redisService from "../../services/redis.service";
import { hashSecret, verifySecret } from "../../utils/hash";
import { signAccessToken, signRefreshToken, verifyRefreshToken } from "../../utils/jwt";
import { BadRequestError, UnauthorizedError, ForbiddenError } from "../../utils/errors";
import { TTL } from "../../services/redis.service";
import { saveOTP, verifyOTP } from "./otp.service";
import { sendOTPEmail } from "../../config/mailer";
import { OtpPurpose } from "./auth.validation";

// -------------------------
// Types
// -------------------------
interface RegisterInput {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  phoneNumber: string;
}

interface LoginInput {
  email: string;
  password: string;
  deviceId?: string;
  ip?: string;
  userAgent?: string;
}

// -------------------------
// Private Helpers
// -------------------------

// Constant-time delay to prevent timing attacks on login
async function timingDelay() {
  await new Promise((resolve) => setTimeout(resolve, 500));
}

async function issueTokenPair(
  userId: string,
  role: string,
  meta?: { deviceId?: string | null; ip?: string | null; userAgent?: string | null }
) {
  const jti = crypto.randomUUID();
  const accessToken = signAccessToken({ userId, role, jti });
  const refreshToken = signRefreshToken({ userId, role, jti });

  await redisService.storeRefreshToken(userId, jti, refreshToken, {
    deviceId: meta?.deviceId ?? undefined,
    ip: meta?.ip ?? undefined,
    userAgent: meta?.userAgent ?? undefined,
  });

  return { accessToken, refreshToken };
}

async function generateAndSendOtp(userId: string, email: string, purpose: OtpPurpose) {
  const otp = await saveOTP(userId, purpose);
  await sendOTPEmail(email, otp);
}

// -------------------------
// Register
// -------------------------
export async function register(input: RegisterInput) {
  const existing = await prisma.user.findFirst({
    where: { OR: [{ email: input.email }, { phoneNumber: input.phoneNumber }] },
  });

  if (existing) {
    throw new BadRequestError(
      existing.email === input.email ? "Email already in use" : "Phone number already in use"
    );
  }

  const hashedPassword = await hashSecret(input.password);

  const user = await prisma.user.create({
    data: {
      firstName: input.firstName,
      lastName: input.lastName,
      email: input.email,
      password: hashedPassword,
      phoneNumber: input.phoneNumber,
    },
    select: { id: true, firstName: true, lastName: true, email: true, phoneNumber: true, role: true, password: true, isEmailVerified: true },
  });

  // Send OTP — wrapped so email failure doesn't break registration
  try {
    await generateAndSendOtp(user.id, user.email, "EMAIL_VERIFICATION");
  } catch {
    // Log in production: logger.error("OTP email failed", user.id)
  }

  return {
    message: "Registration successful. OTP sent to your email.",
    userId: user.id,
  };
}

// -------------------------
// Login
// -------------------------
export async function login(input: LoginInput) {
  
  const user = await prisma.user.findUnique({ where: { email: input.email } });

  if (!user) {
    await timingDelay();
    throw new UnauthorizedError("Invalid credentials");
  }

  const valid = await verifySecret(user.password, input.password);
  if (!valid) {
    await timingDelay();
    throw new UnauthorizedError("Invalid credentials");
  }

  // Unverified — resend OTP and tell frontend to show verify screen
  if (!user.isEmailVerified) {
    try {
      await generateAndSendOtp(user.id, user.email, "EMAIL_VERIFICATION");
    } catch {
      // Log in production
    }
    return {
      message: "Account not verified. OTP sent to your email.",
      needVerification: true,
      userId: user.id,
    };
  }

  const tokens = await issueTokenPair(user.id, user.role, {
    deviceId: input.deviceId,
    ip: input.ip,
    userAgent: input.userAgent,
  });

  return {
    message: "Login successful",
    user: { id: user.id, firstName: user.firstName, lastName: user.lastName, email: user.email, role: user.role },
    ...tokens,
  };
}

// -------------------------
// Verify OTP
// Handles both EMAIL_VERIFICATION and can be extended for PASSWORD_RESET
// No token required — userId comes from the response of register/login
// -------------------------
export async function verifyOtp(userId: string, otp: string, purpose: OtpPurpose = "EMAIL_VERIFICATION") {
  const isValid = await verifyOTP(userId, otp, purpose);
  if (!isValid) throw new ForbiddenError("Invalid or expired OTP");

  if (purpose === "EMAIL_VERIFICATION") {
    const user = await prisma.user.update({
      where: { id: userId },
      data: { isEmailVerified: true },
      select: { id: true, firstName: true, lastName: true, email: true, role: true },
    });

    // Issue tokens immediately — user is verified, log them in right away
    const tokens = await issueTokenPair(user.id, user.role);

    return {
      message: "Account verified successfully",
      user,
      ...tokens,
    };
  }

  // For PASSWORD_RESET purpose — just confirm OTP is valid, password update is separate
  return { message: "OTP verified" };
}

// -------------------------
// Resend OTP
// Public — takes email, no token required
// -------------------------
export async function resendOtp(email: string, purpose: OtpPurpose = "EMAIL_VERIFICATION") {
  const user = await prisma.user.findUnique({
    where: { email },
    select: { id: true, email: true, isEmailVerified: true },
  });

  // Always return same message — prevents user enumeration
  if (!user || (purpose === "EMAIL_VERIFICATION" && user.isEmailVerified)) {
    return { message: "If this email exists, an OTP has been sent." };
  }

  await generateAndSendOtp(user.id, user.email, purpose);

  return { message: "If this email exists, an OTP has been sent." };
}

// -------------------------
// Forgot Password
// -------------------------
export async function forgotPassword(email: string) {
  const user = await prisma.user.findUnique({
    where: { email },
    select: { id: true, email: true },
  });

  // Always succeed — prevents email enumeration
  if (user) {
    await generateAndSendOtp(user.id, user.email, "PASSWORD_RESET");
  }

  return { message: "If this email exists, a password reset OTP has been sent." };
}

// -------------------------
// Reset Password
// -------------------------
export async function resetPassword(userId: string, otp: string, newPassword: string) {
  const isValid = await verifyOTP(userId, otp, "PASSWORD_RESET");
  if (!isValid) throw new ForbiddenError("Invalid or expired OTP");

  const hashedPassword = await hashSecret(newPassword);

  await prisma.user.update({
    where: { id: userId },
    data: { password: hashedPassword },
  });

  // Revoke all active sessions — password changed, force re-login everywhere
  await redisService.revokeAllUserTokens(userId);

  return { message: "Password reset successful. Please log in again." };
}
// -------------------------
// Refresh Token Rotation
// -------------------------
export async function refreshTokens(rawRefreshToken: string) {
  let payload;
  try {
    payload = verifyRefreshToken(rawRefreshToken);
  } catch {
    throw new UnauthorizedError("Invalid or expired refresh token");
  }

  const { userId, role, jti } = payload;
  if (!jti) throw new UnauthorizedError("Malformed token");

  const session = await redisService.verifyRefreshTokenAndGetSession(userId, jti, rawRefreshToken);
  if (!session) throw new UnauthorizedError("Session not found or token revoked");

  // 1. FETCH THE USER FROM YOUR DATABASE
  // (Replace `prisma.user` with your actual database model/query)
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: {
      id: true,
      firstName: true,
      lastName: true,
      email: true,
      role: true,
      isEmailVerified: true,
      // Add any other fields your frontend Redux state needs (avatar, etc.)
    }
  });

  if (!user) {
    throw new UnauthorizedError("User no longer exists");
  }

  await redisService.revokeRefreshToken(userId, jti);

  const tokens = await issueTokenPair(userId, role, {
    deviceId: session.deviceId,
    ip: session.ip,
    userAgent: session.userAgent,
  });

  // 2. RETURN THE USER ALONGSIDE THE TOKENS
  return {
    accessToken: tokens.accessToken,
    refreshToken: tokens.refreshToken,
    user: user, 
  };
}
// -------------------------
// Logout
// -------------------------
export async function logout(userId: string, jti: string, accessTokenJti?: string) {
  await redisService.revokeRefreshToken(userId, jti);
  if (accessTokenJti) {
    await redisService.blacklistTokenJti(accessTokenJti, TTL.REFRESH_TOKEN);
  }
}

export async function logoutAll(userId: string) {
  await redisService.revokeAllUserTokens(userId);
}