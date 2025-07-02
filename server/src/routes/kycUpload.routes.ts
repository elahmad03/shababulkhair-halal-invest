// routes/kyc.routes.ts
import { Router } from "express";
import { uploadKYCFiles, getKYCStatus } from "../controllers/kycUpload.controller";
import { authMiddleware } from "../middleware/auth";
import { upload } from "../middleware/upload";

const router = Router();

// Upload KYC documents
router.post(
  "/upload",
  authMiddleware,
  upload.fields([
    { name: "idCard", maxCount: 1 },
    { name: "selfie", maxCount: 1 },
  ]),
  uploadKYCFiles
);

// Get KYC status
router.get(
  "/status", 
  authMiddleware, 
  getKYCStatus
);

export default router;