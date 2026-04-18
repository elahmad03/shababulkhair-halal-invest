import { Router } from "express";
import { authMiddleware, authorizeRoles } from "../../common/middleware/auth.middleware"; // Update path as needed
import * as WalletController from "./wallet.controller";

const router = Router();

// ==========================================
// USER ROUTES (Protected)
// ==========================================
router.get(
  "/summary",
  authMiddleware,
  WalletController.getWalletSummary
);
router.post(
  "/deposit/initialize",
  authMiddleware,
  WalletController.initializeDeposit
);

router.post(
  "/withdraw",
  authMiddleware,
  WalletController.requestWithdrawal
);

// ==========================================
// ADMIN ROUTES (Protected + Role Check)
// ==========================================
router.post(
  "/admin/withdrawals/:id/resolve",
  authMiddleware,
  authorizeRoles("ADMIN", "COMMITTEE"),
  WalletController.resolveWithdrawal
);

// ==========================================
// WEBHOOK ROUTES (Unprotected - Verified via HMAC)
// ==========================================
// Ensure this route uses express.json() in your main app.ts to parse the body
router.post(
  "/paystack",
  WalletController.handlePaystackWebhook
);

export default router;