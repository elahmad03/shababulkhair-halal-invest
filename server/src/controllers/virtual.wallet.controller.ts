import { PaystackReservedAccountResponse, PaystackWebhookEvent, PaystackChargeSuccessData, PaystackDedicatedAccountWebhookData } from '../types/paystackVirtual.types';
import config from '../config/config';
const PAYSTACK_BASE_URL = 'https://api.paystack.co';

// Helper: Verify Paystack webhook signature
function verifyPaystackSignature(req: Request): boolean {
  const secret = config.paystack.secretKey;
  const signature = req.headers['x-paystack-signature'] as string;
  const hash = crypto.createHmac('sha512', secret).update(JSON.stringify(req.body)).digest('hex');
  return signature === hash;
}

// Controller: Create Virtual Account (Paystack Reserved Account)
export async function createVirtualAccount(req: any, res: Response) {
  try {
    const userId = req.user.id;
    // Fetch user
    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user) return res.status(404).json({ success: false, message: 'User not found' });
    // Fetch wallet
    const wallet = await prisma.wallet.findUnique({ where: { userId } });
    if (wallet && wallet.internalWalletId) {
      return res.status(400).json({ success: false, message: 'Virtual account already exists' });
    }
    // Check NIN (embedded type)
    const nin = (user as any).identity?.nin;
    if (!nin) {
      return res.status(400).json({ success: false, message: 'NIN required. Please update your profile with your NIN before creating a virtual account.' });
    }
    // Call Paystack API
    const response = await axios.post<PaystackReservedAccountResponse>(
      `${PAYSTACK_BASE_URL}/dedicated_account`,
      {
        customer: {
          email: user.email,
          first_name: user.firstName,
          last_name: user.lastName,
          phone: user.phone,
        },
        preferred_bank: 'providus-bank',
        metadata: { userId },
      },
      {
        headers: {
          Authorization: `Bearer ${config.paystack.secretKey}`,
          'Content-Type': 'application/json',
        },
      }
    );
    const { data } = response.data;
    // Upsert wallet
    await prisma.wallet.upsert({
      where: { userId },
      update: {
        internalWalletId: data.account_number,
        bankName: data.bank_name,
        bankAccountNumber: data.account_number,
        type: 'VIRTUAL',
      },
      create: {
        userId,
        internalWalletId: data.account_number,
        bankName: data.bank_name,
        bankAccountNumber: data.account_number,
        type: 'VIRTUAL',
        balance: 0,
      },
    });
    return res.status(201).json({ success: true, message: 'Virtual account created', data });
  } catch (error: any) {
    console.error('Error creating virtual account:', error.response?.data || error.message);
    return res.status(500).json({ success: false, message: error.response?.data?.message || error.message });
  }
}

// Controller: Paystack Webhook
export async function paystackWebhook(req: Request, res: Response) {
  try {
    if (!verifyPaystackSignature(req)) {
      return res.status(400).json({ message: 'Invalid Paystack signature' });
    }
    const event = req.body as PaystackWebhookEvent;
    if (event.event === 'charge.success' || event.event === 'transfer.success') {
      const data = event.data as any;
      // Defensive: metadata may be nested or not present
      const userId = data.metadata?.userId || (data.customer?.metadata?.userId);
      const amountInKobo = data.amount;
      const amountInNaira = amountInKobo / 100;
      const reference = data.reference;
      const status = data.status;
      if (!userId || status !== 'success') return res.status(200).json({ message: 'Ignored' });
      // Idempotency check
      const existing = await prisma.walletTransaction.findUnique({ where: { reference } });
      if (existing) return res.status(200).json({ message: 'Already processed' });
      const wallet = await prisma.wallet.findUnique({ where: { userId } });
      if (!wallet) return res.status(404).json({ message: 'Wallet not found' });
      await prisma.$transaction(async (tx) => {
        await tx.walletTransaction.create({
          data: {
            walletId: wallet.id,
            userId,
            amount: amountInNaira,
            type: 'DEPOSIT',
            reference,
            status: 'SUCCESS',
            provider: 'PAYSTACK_RESERVED_ACCOUNT',
            narration: `Funds received via Paystack Reserved Account`,
            metadata: JSON.stringify(data),
          },
        });
        await tx.wallet.update({ where: { id: wallet.id }, data: { balance: { increment: amountInNaira } } });
      });
      return res.status(200).json({ message: 'Wallet credited' });
    } else if (event.event === 'dedicated_account.assign') {
      const data = event.data as any;
      const userId = data.metadata?.userId;
      const accountNumber = data.dedicated_account?.account_number;
      const bankName = data.dedicated_account?.bank?.name;
      if (userId && accountNumber && bankName) {
        await prisma.wallet.upsert({
          where: { userId },
          update: {
            internalWalletId: accountNumber,
            bankName: bankName,
            bankAccountNumber: accountNumber,
            type: 'VIRTUAL',
          },
          create: {
            userId,
            internalWalletId: accountNumber,
            bankName: bankName,
            bankAccountNumber: accountNumber,
            type: 'VIRTUAL',
            balance: 0,
          },
        });
        return res.status(200).json({ message: 'Dedicated account assigned' });
      } else {
        return res.status(400).json({ message: 'No userId or account info in metadata' });
      }
    }
    return res.status(200).json({ message: 'Event ignored' });
  } catch (error: any) {
    console.error('Paystack webhook error:', error);
    return res.status(500).json({ message: 'Webhook error' });
  }
}
import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import axios, { AxiosResponse } from 'axios';
import crypto from 'crypto';
import { AuthenticatedRequest } from '../middleware/auth1';
import {
  MonnifyConfig,
  MonnifyTokenResponse,
  MonnifyInitTransactionPayload,
  MonnifyInitTransactionResponse,
  MonnifyVerificationResponse,
  MonnifyWebhookPayload,
  FundingInitializeRequest,
  FundingInitializeResponse,
  FundingVerifyResponse,
  WalletBalanceResponse,
  TransactionsResponse
} from '../types';

const prisma = new PrismaClient();

// Monnify configuration
const MONNIFY_CONFIG: MonnifyConfig = {
  baseUrl: process.env.MONNIFY_BASE_URL || 'https://sandbox.monnify.com',
  apiKey: process.env.MONNIFY_API_KEY!,
  secretKey: process.env.MONNIFY_SECRET_KEY!,
  contractCode: process.env.MONNIFY_CONTRACT_CODE!,
  webhookSecret: process.env.MONNIFY_WEBHOOK_SECRET!
};

class WalletController {
  // Get Monnify access token
  private async getMonnifyToken(): Promise<string> {
    try {
      const auth = Buffer.from(`${MONNIFY_CONFIG.apiKey}:${MONNIFY_CONFIG.secretKey}`).toString('base64');
      
      const response: AxiosResponse<MonnifyTokenResponse> = await axios.post(
        `${MONNIFY_CONFIG.baseUrl}/api/v1/auth/login`,
        {},
        {
          headers: {
            'Authorization': `Basic ${auth}`,
            'Content-Type': 'application/json'
          }
        }
      );

      if (!response.data.requestSuccessful) {
        throw new Error(response.data.responseMessage);
      }

      return response.data.responseBody.accessToken;
    } catch (error: any) {
      console.error('Monnify token error:', error.response?.data || error.message);
      throw new Error('Failed to get Monnify access token');
    }
  }

  // Initialize funding transaction
  public async initializeFunding(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const { amount }: FundingInitializeRequest = req.body;
      const userId = req.user.id;

      // Validate amount
      if (!amount || amount <= 0) {
        res.status(400).json({
          success: false,
          message: 'Invalid amount'
        } as FundingInitializeResponse);
        return;
      }

      // Get user details
      const user = await prisma.user.findUnique({
        where: { id: userId },
        include: { wallet: true }
      });

      if (!user) {
        res.status(404).json({
          success: false,
          message: 'User not found'
        } as FundingInitializeResponse);
        return;
      }

      // Ensure user has a wallet
      let wallet = user.wallet;
      if (!wallet) {
        wallet = await prisma.wallet.create({
          data: {
            userId: userId,
            internalWalletId: `INT_${Date.now()}_${userId.slice(-6)}`,
            balance: 0,
            tier: 1
          }
        });
      }

      // Generate unique reference
      const reference = `FUND_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

      // Get Monnify token
      const accessToken = await this.getMonnifyToken();

      // Initialize transaction with Monnify
      const monnifyPayload: MonnifyInitTransactionPayload = {
        amount: parseFloat(amount.toString()),
        customerName: `${user.firstName} ${user.lastName}`,
        customerEmail: user.email,
        paymentReference: reference,
        paymentDescription: 'Wallet Funding',
        currencyCode: 'NGN',
        contractCode: MONNIFY_CONFIG.contractCode,
        redirectUrl: `${process.env.FRONTEND_URL}/wallet/funding-success`,
        paymentMethods: ['CARD', 'ACCOUNT_TRANSFER']
      };

      const monnifyResponse: AxiosResponse<MonnifyInitTransactionResponse> = await axios.post(
        `${MONNIFY_CONFIG.baseUrl}/api/v1/merchant/transactions/init-transaction`,
        monnifyPayload,
        {
          headers: {
            'Authorization': `Bearer ${accessToken}`,
            'Content-Type': 'application/json'
          }
        }
      );

      if (!monnifyResponse.data.requestSuccessful) {
        throw new Error(monnifyResponse.data.responseMessage);
      }

      const { responseBody } = monnifyResponse.data;

      // Create pending transaction record
      const transaction = await prisma.walletTransaction.create({
        data: {
          userId: userId,
          walletId: wallet.id,
          amount: parseFloat(amount.toString()),
          type: 'FUNDING',
          reference: reference,
          status: 'PENDING',
          provider: 'monnify',
          narration: 'Wallet funding via Monnify',
          metadata: {
            monnifyTransactionReference: responseBody.transactionReference,
            monnifyCheckoutUrl: responseBody.checkoutUrl,
            paymentReference: reference
          }
        }
      });

      res.status(200).json({
        success: true,
        message: 'Funding initialized successfully',
        data: {
          reference: reference,
          checkoutUrl: responseBody.checkoutUrl,
          amount: amount,
          transactionId: transaction.id
        }
      } as FundingInitializeResponse);

    } catch (error: any) {
      console.error('Initialize funding error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to initialize funding',
        error: error.message
      } as FundingInitializeResponse);
    }
  }

  // Verify funding transaction
  public async verifyFunding(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const { reference } = req.params;
      const userId = req.user.id;

      // Find the transaction
      const transaction = await prisma.walletTransaction.findFirst({
        where: {
          reference: reference,
          userId: userId,
          provider: 'monnify'
        },
        include: {
          wallet: true
        }
      });

      if (!transaction) {
        res.status(404).json({
          success: false,
          message: 'Transaction not found'
        } as FundingVerifyResponse);
        return;
      }

      // If already successful, return success
      if (transaction.status === 'SUCCESS') {
        res.status(200).json({
          success: true,
          message: 'Transaction already verified',
          data: {
            reference: reference,
            amount: transaction.amount,
            status: 'SUCCESS'
          }
        } as FundingVerifyResponse);
        return;
      }

      // Get Monnify token and verify transaction
      const accessToken = await this.getMonnifyToken();
      const monnifyReference = (transaction.metadata as any)?.monnifyTransactionReference;

      const verifyResponse: AxiosResponse<MonnifyVerificationResponse> = await axios.get(
        `${MONNIFY_CONFIG.baseUrl}/api/v2/transactions/${encodeURIComponent(monnifyReference)}`,
        {
          headers: {
            'Authorization': `Bearer ${accessToken}`
          }
        }
      );

      if (!verifyResponse.data.requestSuccessful) {
        throw new Error(verifyResponse.data.responseMessage);
      }

      const { responseBody } = verifyResponse.data;

      if (responseBody.paymentStatus === 'PAID') {
        // Update transaction status and wallet balance
        await prisma.$transaction(async (tx) => {
          // Update transaction
          await tx.walletTransaction.update({
            where: { id: transaction.id },
            data: {
              status: 'SUCCESS',
              metadata: {
                ...(transaction.metadata as any),
                verificationData: responseBody,
                verifiedAt: new Date()
              }
            }
          });

          // Update wallet balance
          await tx.wallet.update({
            where: { id: transaction.walletId },
            data: {
              balance: {
                increment: transaction.amount
              }
            }
          });
        });

        res.status(200).json({
          success: true,
          message: 'Funding successful',
          data: {
            reference: reference,
            amount: transaction.amount,
            status: 'SUCCESS'
          }
        } as FundingVerifyResponse);
      } else {
        // Update transaction as failed
        await prisma.walletTransaction.update({
          where: { id: transaction.id },
          data: {
            status: 'FAILED',
            metadata: {
              ...(transaction.metadata as any),
              verificationData: responseBody,
              verifiedAt: new Date()
            }
          }
        });

        res.status(400).json({
          success: false,
          message: 'Payment not completed',
          data: {
            reference: reference,
            status: responseBody.paymentStatus
          }
        } as FundingVerifyResponse);
      }

    } catch (error: any) {
      console.error('Verify funding error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to verify transaction',
        error: error.message
      } as FundingVerifyResponse);
    }
  }

  // Handle Monnify webhook
  public async handleMonnifyWebhook(req: Request, res: Response): Promise<void> {
    try {
      const signature = req.headers['monnify-signature'] as string;
      const payload = JSON.stringify(req.body);

      // Verify webhook signature
      const hash = crypto
        .createHmac('sha512', MONNIFY_CONFIG.webhookSecret)
        .update(payload)
        .digest('hex');

      if (hash !== signature) {
        res.status(400).json({ message: 'Invalid signature' });
        return;
      }

      const { eventType, eventData }: MonnifyWebhookPayload = req.body;

      if (eventType === 'SUCCESSFUL_TRANSACTION') {
        const { paymentReference, amountPaid } = eventData;

        // Find transaction by reference
        const transaction = await prisma.walletTransaction.findFirst({
          where: {
            reference: paymentReference,
            provider: 'monnify',
            status: 'PENDING'
          },
          include: { wallet: true }
        });

        if (transaction) {
          // Update transaction and wallet balance
          await prisma.$transaction(async (tx) => {
            await tx.walletTransaction.update({
              where: { id: transaction.id },
              data: {
                status: 'SUCCESS',
                metadata: {
                  ...(transaction.metadata as any),
                  webhookData: eventData,
                  processedAt: new Date()
                }
              }
            });

            await tx.wallet.update({
              where: { id: transaction.walletId },
              data: {
                balance: {
                  increment: parseFloat(amountPaid)
                }
              }
            });
          });
        }
      }

      res.status(200).json({ message: 'Webhook processed' });

    } catch (error: any) {
      console.error('Webhook error:', error);
      res.status(500).json({ message: 'Webhook processing failed' });
    }
  }

  // Get wallet balance
  public async getWalletBalance(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const userId = req.user.id;

      const wallet = await prisma.wallet.findUnique({
        where: { userId: userId }
      });

      if (!wallet) {
        res.status(404).json({
          success: false,
          message: 'Wallet not found'
        } as WalletBalanceResponse);
        return;
      }

      res.status(200).json({
        success: true,
        data: {
          balance: wallet.balance,
          tier: wallet.tier,
          walletId: wallet.internalWalletId
        }
      } as WalletBalanceResponse);

    } catch (error: any) {
      console.error('Get balance error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to get wallet balance'
      } as WalletBalanceResponse);
    }
  }

  // Get wallet transactions
  public async getTransactions(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const userId = req.user.id;
      const { page = '1', limit = '20', type } = req.query;

      const where: any = { userId: userId };
      if (type) where.type = type;

      const transactions = await prisma.walletTransaction.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip: (parseInt(page as string) - 1) * parseInt(limit as string),
        take: parseInt(limit as string)
      });

      const total = await prisma.walletTransaction.count({ where });

      res.status(200).json({
        success: true,
        data: {
          transactions,
          pagination: {
            page: parseInt(page as string),
            limit: parseInt(limit as string),
            total,
            pages: Math.ceil(total / parseInt(limit as string))
          }
        }
      } as TransactionsResponse);

    } catch (error: any) {
      console.error('Get transactions error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to get transactions'
      } as TransactionsResponse);
    }
  }
}

export const walletController = new WalletController();