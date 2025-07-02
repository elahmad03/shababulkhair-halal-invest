// routes/user.routes.ts
import { Router } from "express";
import { 
  getUserProfile,
  updateUserProfile,
  uploadProfilePicture,
  changePassword,
  getUserWalletInfo,
  deleteUserAccount
} from "../controllers/userProfile.controller";
import { upload } from "../middleware/upload";
import { authMiddleware } from "../middleware/auth";
import { validateUpdateProfile, validateChangePassword } from "../middleware/validation";

const router = Router();

// Get current user profile
router.get("/profile", authMiddleware, getUserProfile);

// Update user profile
router.put("/profile", authMiddleware, validateUpdateProfile, updateUserProfile);

// Upload profile picture
router.post("/profile/picture", authMiddleware, upload.single("image"), uploadProfilePicture);

// Change password
router.put("/password", authMiddleware, validateChangePassword, changePassword);

// Get wallet information
router.get("/wallet", authMiddleware, getUserWalletInfo);

// Delete account (soft delete)
router.delete("/account", authMiddleware, deleteUserAccount);

export default router;