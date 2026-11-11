import { Router } from "express";
import { KycController } from "./kyc.controller";
import { authMiddleware, authorizeRoles, rejectRoles } from "../../common/middleware/auth.middleware";

const router = Router();

// ── User routes ───────────────────────────────────────────────────────────────
router.get("/signature", authMiddleware, KycController.getUploadSignature);
router.post("/",         authMiddleware, rejectRoles("COMMITTEE"), KycController.submit);
router.get("/me",        authMiddleware, KycController.me);

// ── Admin routes ─────────────
router.get("/pending",           authMiddleware, authorizeRoles("ADMIN"), KycController.pending);
router.get("/:kycId",            authMiddleware, authorizeRoles("ADMIN"), KycController.detail);   // ← was missing
router.patch("/approve/:kycId",  authMiddleware, authorizeRoles("ADMIN"), KycController.approve);
router.patch("/reject/:kycId",   authMiddleware, authorizeRoles("ADMIN"), KycController.reject);

export default router;