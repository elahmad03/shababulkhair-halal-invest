// src/webhook/moniepoint.ts
import { Router, Request, Response } from 'express';
import prisma from '../prisma/client';

const router = Router();

router.post('/', async (req: Request, res: Response) => {
  try {
    const { accountNumber, amount, reference, senderName } = req.body;

    // 1. Find the wallet by Moniepoint account number
    const wallet = await prisma.wallet.findFirst({
      where: { bankAccountNumber: accountNumber },
    });

    if (!wallet) {
      return res.status(404).json({ message: 'Wallet not found' });
    }

    // 2. Credit the wallet balance
    await prisma.wallet.update({
      where: { id: wallet.id },
      data: {
        balance: { increment: amount },
      },
    });

    // 3. Log the transaction
    await prisma.walletTransaction.create({
      data: {
        walletId: wallet.id,
        amount,
        type: 'CREDIT',
        reference,
        status: 'SUCCESS',
        narration: `Moniepoint transfer from ${senderName || 'unknown'}`,
        metadata: { senderName },
      },
    });

    return res.status(200).json({ message: 'Wallet credited successfully' });
  } catch (error: any) {
    console.error('Webhook error:', error);
    return res.status(500).json({ message: 'Error processing webhook', details: error.message });
  }
});

export default router;
