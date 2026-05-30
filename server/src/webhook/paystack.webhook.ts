import { Router } from "express";
import * as Walletcontroller from "../modules/wallet/wallet.controller"

// ==========================================
// WEBHOOK ROUTES (Unprotected - Verified via HMAC)
// ==========================================
const router = Router();

// POST /api/wallet/paystack - Paystack webhook
router.post(
  "/paystack",
  Walletcontroller.handlePaystackWebhook
);

export default router;