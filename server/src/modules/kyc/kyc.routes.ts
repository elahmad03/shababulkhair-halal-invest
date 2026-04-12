import { Router } from "express";
import { KycController } from "./kyc.controller";
import { authMiddleware, authorizeRoles } from "../../common/middleware/auth.middlware";

const router = Router();

// ── User routes ───────────────────────────────────────────────────────────────
router.get("/signature", authMiddleware, KycController.getUploadSignature);
router.post("/",         authMiddleware, KycController.submit);
router.get("/me",        authMiddleware, KycController.me);

// ── Admin routes — authMiddleware MUST come before authorizeRoles ─────────────
router.get("/pending",           authMiddleware, authorizeRoles("ADMIN"), KycController.pending);
router.get("/:kycId",            authMiddleware, authorizeRoles("ADMIN"), KycController.detail);   // ← was missing
router.patch("/approve/:kycId",  authMiddleware, authorizeRoles("ADMIN"), KycController.approve);
router.patch("/reject/:kycId",   authMiddleware, authorizeRoles("ADMIN"), KycController.reject);

export default router;