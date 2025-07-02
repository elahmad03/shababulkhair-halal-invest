import { Router } from 'express';
import { distributeBusinessProfit, addBusinessProfit } from '../controllers/profit.controller';
import { authMiddleware, isAdmin } from '../middleware/auth';

const router = Router();

// Admin-only routes
router.post('/distribute', authMiddleware, isAdmin, distributeBusinessProfit);
router.post('/add', authMiddleware, isAdmin, addBusinessProfit);

export default router;
// 