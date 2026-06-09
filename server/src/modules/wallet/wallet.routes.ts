import { Router } from "express";
import { authMiddleware, authorizeRoles } from "../../common/middleware/auth.middleware";
import * as WalletController from "./wallet.controller";

const router = Router();

// ==========================================
// MEMBER ROUTES (Protected)
// ==========================================

// GET /api/wallet/me - Get authenticated user's wallet
router.get(
  "/me",
  authMiddleware,
  WalletController.getMyWallet
);

// GET /api/wallet/summary - Get wallet summary with recent transactions
router.get(
  "/summary",
  authMiddleware,
  WalletController.getWalletSummary
);

// POST /api/wallet/deposit/initialize - Initialize Paystack deposit
router.post(
  "/deposit/initialize",
  authMiddleware,
  WalletController.initializeDeposit
);

// POST /api/wallet/withdraw - Request withdrawal
router.post(
  "/withdraw",
  authMiddleware,
  WalletController.requestWithdrawal
);

// GET /api/wallet/transactions - Get transaction history
router.get(
  "/transactions",
  authMiddleware,
  WalletController.getTransactions
);

// ==========================================
// ADMIN ROUTES (Protected + Role Check)
// ==========================================

// GET /api/wallet/admin/:userId - Get user's wallet as admin
router.get(
  "/admin/:userId",
  authMiddleware,
  authorizeRoles("ADMIN"),
  WalletController.getAdminWallet
);

// POST /api/wallet/admin/adjust - Admin manual wallet adjustment
router.post(
  "/admin/adjust",
  authMiddleware,
  authorizeRoles("ADMIN"),
  WalletController.adminAdjust
);

// GET /api/wallet/admin/withdrawals - List withdrawals with filters
router.get(
  "/admin/withdrawals",
  authMiddleware,
  authorizeRoles("ADMIN"),
  WalletController.listWithdrawals
);

// POST /api/wallet/admin/withdrawals/:id/resolve - Resolve withdrawal request
router.post(
  "/admin/withdrawals/:id/resolve",
  authMiddleware,
  authorizeRoles("ADMIN"),
  WalletController.resolveWithdrawal
);

export default router;