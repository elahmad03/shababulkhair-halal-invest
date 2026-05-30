import { Router } from "express";
import { authMiddleware, authorizeRoles } from "../../common/middleware/auth.middleware";
import * as UserController from "./user.controller";

const router = Router();

// All user routes require authentication
router.use(authMiddleware);

// ── Admin Routes ──────────────────────────────────────────────────────────────

// GET /admin/users - List all users with pagination
router.get("/admin", authorizeRoles("ADMIN"), UserController.listUsers);

// GET /admin/users/:id - Get single user details
router.get("/admin/:id", authorizeRoles("ADMIN"), UserController.getUserDetail);

// GET /admin/users/:id/kyc - Get user's KYC profile
router.get("/admin/:id/kyc", authorizeRoles("ADMIN"), UserController.getUserKyc);

// PATCH /admin/users/:id/status - Update user account status
router.patch("/admin/:id/status", authorizeRoles("ADMIN"), UserController.updateUserStatus);

// GET /admin/users/:id/investments - Get user's investments
router.get("/admin/:id/investments", authorizeRoles("ADMIN"), UserController.getUserInvestments);

// GET /admin/users/:id/transactions - Get user's transactions
router.get("/admin/:id/transactions", authorizeRoles("ADMIN"), UserController.getUserTransactions);

// ── Member Routes (Self) ──────────────────────────────────────────────────────

// GET /me - Get authenticated user's profile
router.get("/me", UserController.getMe);

export default router;
