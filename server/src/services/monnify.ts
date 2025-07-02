// services/monnify.service.ts
import axios from 'axios';
import prisma from '../prisma/client';
import config from '../config/config';

const MONNIFY_BASE_URL = config.monnify.baseUrl;
const MONNIFY_API_KEY = config.monnify.apiKey;
const MONNIFY_SECRET_KEY = config.monnify.secretKey;
const MONNIFY_CONTRACT_CODE = config.monnify.contractCode;

export class MonnifyService {
  // 🔐 Get Monnify Auth Token
  private static async getAuthToken(): Promise<string> {
    const authString = Buffer.from(`${MONNIFY_API_KEY}:${MONNIFY_SECRET_KEY}`).toString('base64');
    const response = await axios.post(
      `${MONNIFY_BASE_URL}/api/v1/auth/login`,
      {},
      { headers: { Authorization: `Basic ${authString}` } }
    );
    return response.data.responseBody.accessToken;
  }

  // 🚀 Initialize Transaction
  static async initializeTransaction(userId: string, amount: number, customerEmail: string) {
    const authToken = await this.getAuthToken();
    const reference = `monnify_fund_${Date.now()}`; // Same pattern as paystack

    const paymentData = {
      amount,
      customerName: await this.getCustomerName(userId),
      customerEmail,
      paymentReference: reference, // 🔑 store this one in DB
      paymentDescription: `Wallet funding for user ${userId}`,
      currencyCode: 'NGN',
      contractCode: MONNIFY_CONTRACT_CODE,
      redirectUrl: `${config.app.baseUrl}/user/wallet/funding/verify`, // 👈 frontend will use ?paymentReference=
      paymentMethods: ['CARD', 'ACCOUNT_TRANSFER'],
      incomeSplitConfig: [],
    };

    const response = await axios.post(
      `${MONNIFY_BASE_URL}/api/v1/merchant/transactions/init-transaction`,
      paymentData,
      { headers: { Authorization: `Bearer ${authToken}` } }
    );

    const wallet = await prisma.wallet.findUnique({ where: { userId }, select: { id: true } });
    if (!wallet) throw new Error('Wallet not found');

    // 💾 Save the reference YOU provided
    await prisma.walletTransaction.create({
      data: {
        walletId: wallet.id,
        userId,
        reference, // ✅ same as you initialized
        amount,
        status: 'PENDING',
        type: 'CREDIT',
        provider: 'MONNIFY',
        metadata: JSON.stringify(response.data.responseBody),
      },
    });

    return {
      reference, // for internal consistency
      checkoutUrl: response.data.responseBody.checkoutUrl,
    };
  }

  // ✅ Verify Monnify Transaction
  static async verifyTransaction(reference: string) {
    const authToken = await this.getAuthToken();

    const response = await axios.get(
      `${MONNIFY_BASE_URL}/api/v2/transactions/${reference}`,
      {
        headers: {
          Authorization: `Bearer ${authToken}`,
        },
      }
    );

    const tx = response.data.responseBody;

    if (tx.paymentStatus !== 'PAID') {
      throw new Error('Transaction not paid yet');
    }

    const dbTx = await prisma.walletTransaction.findUnique({
      where: { reference },
    });

    if (!dbTx) throw new Error('Transaction not found in DB');

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
      paidAt: tx.paidOn,
    };
  }

  // 🙋 Get Full Customer Name
  private static async getCustomerName(userId: string): Promise<string> {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { firstName: true, lastName: true },
    });

    return user ? `${user.firstName} ${user.lastName}` : 'Customer';
  }
}
