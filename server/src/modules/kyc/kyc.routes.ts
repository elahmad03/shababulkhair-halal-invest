import { Router } from "express";
import { KycController } from "./kyc.controller";
import { authMiddleware, authorizeRoles } from "../../common/middleware/auth.middlware";

const router = Router();

router.get("/signature", authMiddleware, KycController.getUploadSignature);

router.post("/", authMiddleware, KycController.submit);
router.get("/me", authMiddleware, KycController.me);

// ADMIN
router.get("/pending", authorizeRoles("ADMIN"), KycController.pending);
router.patch("/approve/:kycId", authorizeRoles("ADMIN"), KycController.approve);
router.patch("/reject/:kycId", authorizeRoles("ADMIN"), KycController.reject);

export default router;