/**
 * venture.routes.ts
 * Mounted at /ventures in app.ts
 */

import { Router } from "express";
import { authMiddleware, authorizeRoles } from "../../common/middleware/auth.middleware";
import * as VentureController from "./venture.controller";

const router = Router();

// All venture routes require authentication
router.use(authMiddleware);

// ── Authenticated Read Routes (Any authenticated user) ─────────────────────────

/**
 * GET /ventures
 * List all business ventures across the platform
 */
router.get("/", VentureController.listVentures);

/**
 * GET /ventures/cycle/:cycleId
 * All ventures for a cycle + summary stats
 */
router.get("/cycle/:cycleId", VentureController.getVenturesByCycle);

/**
 * GET /ventures/:id
 * Single venture detail
 */
router.get("/:id", VentureController.getVentureById);

/**
 * GET /ventures/:id/investors
 * List investors for a venture's cycle
 */
router.get("/:id/investors", VentureController.getVentureInvestors);

/**
 * GET /ventures/:id/agreement-receipt
 * Any authenticated user can view the venture agreement receipt
 */
router.get("/:id/agreement-receipt", VentureController.getAgreementReceipt);

// ── Committee & Admin Routes (VentureProfitEntry) ─────────────────────────────

/**
 * POST /ventures/:id/profit-entries
 * Committee or Admin records a profit entry (committee can only record their own)
 */
router.post(
  "/:id/profit-entries",
  authorizeRoles("ADMIN", "COMMITTEE"),
  VentureController.createProfitEntry
);

/**
 * PATCH /ventures/profit-entries/:entryId
 * Committee or Admin edits a profit entry (committee can only edit their own)
 */
router.patch(
  "/profit-entries/:entryId",
  authorizeRoles("ADMIN", "COMMITTEE"),
  VentureController.updateProfitEntry
);

/**
 * GET /ventures/:id/profit-entries
 * Committee reads only their own entries; Admin reads all entries
 */
router.get(
  "/:id/profit-entries",
  authorizeRoles("ADMIN", "COMMITTEE"),
  VentureController.getProfitEntries
);

// ── Admin-Only Write Routes ───────────────────────────────────────────────────

const adminOnly = authorizeRoles("ADMIN");

/**
 * POST /ventures
 * Create a venture — cycleId in body
 */
router.post("/", adminOnly, VentureController.createVenture);

/**
 * PATCH /ventures/:id
 * Update name, expected profit, or manager
 */
router.patch("/:id", adminOnly, VentureController.updateVenture);

/**
 * PATCH /ventures/:id/profit
 * Record or update realized profit for a venture
 */
router.patch("/:id/profit", adminOnly, VentureController.recordProfit);

/**
 * DELETE /ventures/:id
 * Only allowed if cycle is ACTIVE and profit is 0
 */
router.delete("/:id", adminOnly, VentureController.deleteVenture);

/**
 * POST /ventures/:id/agreement-receipt
 * Admin only: upload or replace agreement receipt
 */
router.post("/:id/agreement-receipt", adminOnly, VentureController.uploadAgreementReceipt);

export default router;