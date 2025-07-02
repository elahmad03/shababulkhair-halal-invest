import { Router } from 'express';
import { authMiddleware } from '../middleware/auth';
import { getWalletBalance, getCryptoWallet, getFullWalletInfo, verifyMonnifyFunding, initializeMonnifyFunding, debugWalletTransactions, debugWallets, initializePaystackFunding, verifyPaystackFunding } from '../controllers/wallet.controller';

const router = Router();

router.get('/balance', authMiddleware, getWalletBalance);
router.get('/crypto', authMiddleware, getCryptoWallet);
router.get('/full', authMiddleware, getFullWalletInfo);

// Wallet funding endpoints
router.post('/fund/initialize/monnify', authMiddleware, initializeMonnifyFunding);
router.post('/fund/initialize/paystack', authMiddleware, initializePaystackFunding);
router.get('/fund/verify/monnify/:reference', authMiddleware, verifyMonnifyFunding);
router.get('/fund/verify/paystack/:reference', authMiddleware, verifyPaystackFunding);
router.get('/fund/verify/paystack/:reference', authMiddleware, verifyPaystackFunding);

router.get('/debug/transactions', authMiddleware, debugWalletTransactions);
router.get('/debug/wallets', authMiddleware, debugWallets);

export default router;
