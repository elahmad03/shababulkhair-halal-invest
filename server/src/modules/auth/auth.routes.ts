import { Router } from "express";
import * as authController from "./auth.controller";
import * as otpController from "./otp.controller";
import { authMiddleware } from "../../common/middleware/auth.middleware";
import { rateLimit } from "../../common/middleware/rateLimit";

const router = Router();

// -------------------------
// Public
// -------------------------
router.post("/sign-up", rateLimit, authController.register);
router.post("/sign-in", rateLimit, authController.login);
router.post("/refresh", rateLimit, authController.refresh);
router.post("/otp/verify", rateLimit, otpController.verifyEmailOTP);
router.post("/otp/resend", rateLimit, otpController.resendOTP);
router.post("/forgot-password", rateLimit, otpController.forgotPasswordHandler);
router.post("/reset-password", rateLimit, otpController.resetPasswordHandler);

// -------------------------
// Protected
// -------------------------
router.post("/logout", authMiddleware, authController.logout);
router.post("/logout-all", authMiddleware, authController.logoutAll);

export default router;