import { Router } from "express";
import { authMiddleware, authorizeRoles } from "../../common/middleware/auth.middleware";
import * as CycleController from "./cycle.controller";

const router = Router();

// All cycle routes require authentication
router.use(authMiddleware);

// ============================================================
// PUBLIC (any authenticated member)
// ============================================================

/**
 * GET /cycles
 * List all investment cycles — paginated
 * ?page=1&limit=10
 */
router.get("/", CycleController.listCycles);

/**
 * GET /cycles/my-history
 * All cycles the authenticated member has invested in
 * ⚠️ MUST come BEFORE /:id route to avoid being caught by parameterized route
 */
router.get("/my-history", CycleController.getMemberInvestmentHistory);

/**
 * GET /cycles/:id
 * Full detail of a single cycle — members see investor list and ventures
 */
router.get("/:id", CycleController.getCycleById);

/**
 * GET /cycles/:id/my-position
 * A member's own shareholding in this cycle
 */
router.get("/:id/my-position", CycleController.getMemberPosition);

/**
 * POST /cycles/:id/shares/purchase
 * Member buys shares in an OPEN_FOR_INVESTMENT cycle
 * Requires: Idempotency-Key header
 */
router.post("/:id/shares/purchase", CycleController.purchaseShares);

// ============================================================
// ADMIN
// ============================================================

const adminOrCommittee = authorizeRoles("ADMIN");

/**
 * POST /cycles
 * Create a new investment cycle
 */
router.post("/", adminOrCommittee, CycleController.createCycle);

/**
 * PATCH /cycles/:id/open
 * PENDING → OPEN_FOR_INVESTMENT
 */
router.patch("/:id/open", adminOrCommittee, CycleController.openCycle);

/**
 * PATCH /cycles/:id/activate
 * OPEN_FOR_INVESTMENT → ACTIVE (closes investment window)
 */
router.patch("/:id/activate", adminOrCommittee, CycleController.activateCycle);

/**
 * PATCH /cycles/:id/complete
 * ACTIVE → COMPLETED (distributes profits to all investors)
 * Body: { investorProfitPercent: 80 }
 */
router.patch("/:id/complete", adminOrCommittee, CycleController.completeCycle);

export default router;