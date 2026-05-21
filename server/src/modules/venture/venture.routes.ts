/**
 * venture.routes.ts
 *
 * Mounted at /ventures in app.ts
 *
 * All routes are ADMIN/COMMITTEE only.
 * Members have no direct venture access — they see venture data
 * as part of the cycle detail response (GET /cycles/:id).
 */

import { Router } from "express";
import { authMiddleware, authorizeRoles } from "../../common/middleware/auth.middleware";
import * as VentureController from "./venture.controller";

const router = Router();

// All venture routes: authenticated + admin/committee only
router.use(authMiddleware);
router.use(authorizeRoles("ADMIN", "COMMITTEE"));

/**
 * GET /ventures/cycle/:cycleId
 * All ventures for a cycle + summary stats (total allocated, expected, realized)
 */
router.get("/cycle/:cycleId", VentureController.getVenturesByCycle);

/**
 * GET /ventures/:id
 * Single venture detail
 */
router.get("/:id", VentureController.getVentureById);

/**
 * POST /ventures
 * Create a venture — cycleId in body
 * Body: { cycleId, companyName, allocatedAmountNaira, expectedProfitNaira, managedById }
 */
router.post("/", VentureController.createVenture);

/**
 * PATCH /ventures/:id
 * Update name, expected profit, or manager
 * Body: { companyName?, expectedProfitNaira?, managedById? }
 */
router.patch("/:id", VentureController.updateVenture);

/**
 * PATCH /ventures/:id/profit
 * Record or update realized profit for a venture
 * Body: { profitRealizedNaira }
 */
router.patch("/:id/profit", VentureController.recordProfit);

/**
 * DELETE /ventures/:id
 * Only allowed if cycle is ACTIVE and profit is 0
 */
router.delete("/:id", VentureController.deleteVenture);

export default router;