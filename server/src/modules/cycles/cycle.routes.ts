import { Router } from "express";
import { authMiddleware, authorizeRoles } from "../../common/middleware/auth.middleware";
import * as CycleController from "./cycle.controller";

const router = Router();

// All cycle routes require authentication
router.use(authMiddleware);

// ============================================================
// MEMBER / PUBLIC (Any Authenticated User)
// ============================================================

/**
 * GET /cycles
 * List all investment cycles — paginated with optional status filter
 * ?page=1&limit=10&status=OPEN_FOR_INVESTMENT
 */
router.get("/", CycleController.listCycles);

/**
 * GET /cycles/my-history
 * All cycles the authenticated member has invested in
 * ⚠️ MUST come BEFORE /:id route to avoid being matched as param
 */
router.get("/my-history", CycleController.getMemberInvestmentHistory);

/**
 * GET /cycles/:id
 * Full detail of a single cycle (includes ventures and investments)
 */
router.get("/:id", CycleController.getCycleById);

/**
 * GET /cycles/:id/my-investment (and alias /my-position)
 * A member's own shareholding in this cycle
 */
router.get("/:id/my-investment", CycleController.getMemberPosition);
router.get("/:id/my-position", CycleController.getMemberPosition);

/**
 * POST /cycles/:id/invest (and alias /shares/purchase)
 * Member buys shares in an OPEN_FOR_INVESTMENT cycle
 */
router.post("/:id/invest", CycleController.purchaseShares);
router.post("/:id/shares/purchase", CycleController.purchaseShares);

// ============================================================
// ADMIN ROUTES
// ============================================================

const adminOnly = authorizeRoles("ADMIN");

/**
 * POST /cycles
 * Create a new investment cycle
 */
router.post("/", adminOnly, CycleController.createCycle);

/**
 * PATCH /cycles/:id
 * Update cycle details (PENDING status only)
 */
router.patch("/:id", adminOnly, CycleController.updateCycle);

/**
 * PATCH /cycles/:id/status
 * Forward status transition (PENDING → OPEN_FOR_INVESTMENT → ACTIVE → CLOSING → COMPLETED)
 */
router.patch("/:id/status", adminOnly, CycleController.updateCycleStatus);

/**
 * GET /cycles/:id/investments
 * List all shareholder investments in this cycle (paginated)
 */
router.get("/:id/investments", adminOnly, CycleController.getCycleInvestments);

/**
 * POST /cycles/:id/distribute-profit
 * Distribute profit and record split (CLOSING phase only)
 */
router.post("/:id/distribute-profit", adminOnly, CycleController.distributeProfit);

/**
 * Status shortcuts (backward compatibility)
 */
router.patch("/:id/open", adminOnly, CycleController.openCycle);
router.patch("/:id/activate", adminOnly, CycleController.activateCycle);
router.patch("/:id/complete", adminOnly, CycleController.completeCycle);

export default router;