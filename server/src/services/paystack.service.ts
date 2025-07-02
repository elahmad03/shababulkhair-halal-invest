// services/paystack.service.ts

import axios from 'axios';
import prisma from '../prisma/client';
import config from '../config/config';

const PAYSTACK_BASE_URL = 'https://api.paystack.co';

export class PaystackService {
  private static get headers() {
    return {
      Authorization: `Bearer ${config.paystack.secretKey}`,
      'Content-Type': 'application/json',
    };
  }

  // ✅ Initialize Paystack Transaction
  static async initializeTransaction(userId: string, amount: number, email: string) {
    const reference = `paystack_fund_${Date.now()}`;
    const koboAmount = amount * 100; // Paystack requires amount in kobo

    const response = await axios.post(
      `${PAYSTACK_BASE_URL}/transaction/initialize`,
      {
        email,
        amount: koboAmount,
        reference,
        currency: 'NGN',
        callback_url: `${config.app.baseUrl}/user/wallet/funding/verify?provider=paystack`, // frontend page for auto-verification
        metadata: {
          userId, 
          provider: 'PAYSTACK',
        },
        description: 'Wallet funding via Paystack',
      },
      { headers: this.headers }
    );

    const wallet = await prisma.wallet.findUnique({ where: { userId }, select: { id: true } });
    if (!wallet) throw new Error('Wallet not found');

    // ✅ Save the transaction as PENDING
    await prisma.walletTransaction.create({
      data: {
        walletId: wallet.id,
        userId,
        reference,
        amount,
        status: 'PENDING',
        type: 'CREDIT',
        provider: 'PAYSTACK',
        metadata: JSON.stringify(response.data.data),
      },
    });

    return {
      reference,
      authorization_url: response.data.data.authorization_url,
    };
  }

  // ✅ Verify Paystack Transaction
  static async verifyTransaction(reference: string) {
    const response = await axios.get(
      `${PAYSTACK_BASE_URL}/transaction/verify/${reference}`,
      {
        headers: this.headers,
      }
    );

    const tx = response.data.data;

    if (tx.status !== 'success') {
      throw new Error('Transaction not successful');
    }

    const dbTx = await prisma.walletTransaction.findUnique({
      where: { reference },
    });

    if (!dbTx) throw new Error('Transaction not found in DB');

    // ✅ Update Wallet & Mark Transaction as SUCCESS
    if (dbTx.status === 'PENDING') {
      await prisma.$transaction([
        prisma.wallet.update({
          where: { userId: dbTx.userId },
          data: { balance: { increment: dbTx.amount } },
        }),
        prisma.walletTransaction.update({
          where: { reference },
          data: {
            status: 'SUCCESS',
            metadata: JSON.stringify(tx),
          },
        }),
      ]);
    }

    return {
      userId: dbTx.userId,
      amount: dbTx.amount,
      status: 'SUCCESS',
      reference,
      paidAt: tx.paid_at,
    };
  }
}
