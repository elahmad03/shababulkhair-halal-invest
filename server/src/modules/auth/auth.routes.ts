import { Router } from "express";
import * as authController from "./auth.controller";
import * as otpController from "./otp.controller";
import { authMiddleware } from "../../common/middleware/auth.middlware";
import { rateLimit } from "../../common/middleware/rateLimit";

const router = Router();

// -------------------------
// Public
// -------------------------
router.post("/sign-up", authController.register, rateLimit);
router.post("/sign-in", authController.login, rateLimit);
router.post("/refresh", authController.refresh, rateLimit);
router.post("/otp/verify", otpController.verifyEmailOTP, rateLimit);         
router.post("/otp/resend", otpController.resendOTP, rateLimit);             
router.post("/forgot-password", otpController.forgotPasswordHandler, rateLimit); 
router.post("/reset-password", otpController.resetPasswordHandler, rateLimit);   

// -------------------------
// Protected
// -------------------------
router.post("/logout", authMiddleware, authController.logout);
router.post("/logout-all", authMiddleware, authController.logoutAll);

export default router;