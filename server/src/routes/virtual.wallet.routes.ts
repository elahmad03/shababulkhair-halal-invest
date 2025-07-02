import { Router } from 'express';
import { authMiddleware } from '../middleware/auth';
import { createVirtualAccount, paystackWebhook } from '../controllers/virtual.wallet.controller';

const router = Router();

// Authenticated: Create virtual account (requires NIN)
router.post('/create', authMiddleware, (req, res, next) => {
  Promise.resolve(createVirtualAccount(req, res)).catch(next);
});

// Paystack webhook (no auth, signature required)
router.post('/paystack-webhook', (req, res, next) => {
  Promise.resolve(paystackWebhook(req, res)).catch(next);
});

export default router;
