import { Router } from "express";
import { authMiddleware, authorizeRoles, rejectRoles } from "../../common/middleware/auth.middleware";
import * as UserController from "./user.controller";
import * as PreferenceController from "./preference.controller";

const router = Router();

// All user routes require authentication
router.use(authMiddleware);

// ── Admin Routes ──────────────────────────────────────────────────────────────

// GET /admin/users - List all users with pagination
router.get("/admin/users", authorizeRoles("ADMIN"), UserController.listUsers);

// GET /admin/users/:id - Get single user details
router.get("/admin/users/:id", authorizeRoles("ADMIN"), UserController.getUserDetail);

// PATCH /admin/users/:id - Admin edit any user field (writes UserEditLog)
router.patch("/admin/users/:id", authorizeRoles("ADMIN"), UserController.editUser);

// GET /admin/users/:id/kyc - Get user's KYC profile
router.get("/admin/users/:id/kyc", authorizeRoles("ADMIN"), UserController.getUserKyc);

// PATCH /admin/users/:id/status - Update user account status
router.patch("/admin/users/:id/status", authorizeRoles("ADMIN"), UserController.updateUserStatus);

// GET /admin/users/:id/investments - Get user's investments
router.get("/admin/users/:id/investments", authorizeRoles("ADMIN"), UserController.getUserInvestments);

// GET /admin/users/:id/transactions - Get user's transactions
router.get("/admin/users/:id/transactions", authorizeRoles("ADMIN"), UserController.getUserTransactions);

// ── Member Routes (Self) ──────────────────────────────────────────────────────

// GET /me - Get authenticated user's profile
router.get("/me", UserController.getMe);

// GET /me/preferences - Get user's investment preferences
router.get("/me/preferences", PreferenceController.getMyPreferences);

// PUT /me/preferences - Update user's investment preferences (rejects COMMITTEE)
router.put("/me/preferences", rejectRoles("COMMITTEE"), PreferenceController.updateMyPreferences);

export default router;
