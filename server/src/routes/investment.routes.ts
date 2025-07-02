// routes/investment.routes.ts
import { Router } from 'express';
import { buyShares } from '../controllers/investment.controller';
import { authMiddleware } from '../middleware/auth';

const router = Router();

router.post('/buy-shares', authMiddleware, buyShares);

export default router;
