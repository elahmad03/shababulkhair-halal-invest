/**
 * ledger.routes.ts
 * Mounted at /ledger in app.ts
 */

import { Router } from "express";
import { authMiddleware, authorizeRoles } from "../../common/middleware/auth.middleware";
import * as LedgerController from "./ledger.controller";

const router = Router();

router.use(authMiddleware);

// ── Member routes (any authenticated user) ────────────────────────────────────

/** GET /ledger/summary — wallet balance + lifetime category totals */
router.get("/summary",             LedgerController.getMemberSummary);

/** GET /ledger — paginated tx history with filters */
router.get("/",                    LedgerController.getMemberLedger);

/** GET /ledger/transactions/:id — single tx detail */
router.get("/transactions/:id",    LedgerController.getTransactionById);

// ── Admin  routes ──────────────────────────────────────────────────

const admin = authorizeRoles("ADMIN");

/** GET /ledger/org — org INCOME/EXPENSE entries */
router.get( "/org", admin, LedgerController.getOrgLedger);

/** POST /ledger/org — record new org entry */
router.post("/org", admin, LedgerController.recordOrgEntry);

export default router;