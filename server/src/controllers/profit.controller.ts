import { Request, Response } from 'express';
import prisma from '../prisma/client';
import { TransactionType, TransactionStatus, Prisma } from '@prisma/client'; // ✅ Enums, and Prisma for transaction types and error handling

export const distributeBusinessProfit = async (req: Request, res: Response) => {
  const { businessId, amount, notedBy } = req.body;

  if (!businessId || typeof amount !== 'number' || amount <= 0 || !notedBy) {
    res.status(400).json({ message: 'businessId, a positive amount, and notedBy are required.' });
    return; // <-- FIX: Separate res.json from return
  }

  try {
    // Wrap the entire distribution process in a transaction for atomicity
    const result = await prisma.$transaction(async (tx) => {
      const business = await tx.business.findUnique({
        where: { id: businessId },
        include: {
          investors: {
            include: {
              user: {
                include: { wallet: true },
              },
            },
          },
        },
      });

      if (!business) {
        throw new Error('Business not found.'); // Throw error for transaction rollback
      }

      // Check if business.amountAllocated is zero to prevent division by zero
      if (business.amountAllocated <= 0) {
        throw new Error('Business has no allocated amount to distribute profit proportionally.');
      }

      // 1. Create a log for this profit entry
      // This log should ideally be created as 'not distributed' initially,
      // and then marked 'distributed' within the same transaction.
      const profitLog = await tx.businessProfitLog.create({
        data: {
          businessId,
          amount,
          notedBy,
          distributed: false, // Explicitly set to false initially
        },
      });

      // Implement the reserve logic (30% reserve, 70% distributable)
      const reserveAmount = amount * 0.3;
      const distributableAmount = amount * 0.7;

      const walletUpdates: Promise<any>[] = []; // Collect all wallet update promises
      const walletTransactions: Prisma.WalletTransactionCreateManyInput[] = []; // Collect all new wallet transactions

      for (const investor of business.investors) {
        const userWallet = investor.user.wallet;

        if (!userWallet) {
          console.warn(`Wallet not found for user ID: ${investor.userId}. Skipping profit distribution for this investor.`);
          continue; // Skip this investor if wallet not found
        }

        // Calculate user's proportional profit from the distributable amount
        const userProfit = (investor.amount / business.amountAllocated) * distributableAmount;

        // Queue wallet update
        walletUpdates.push(
          tx.wallet.update({
            where: { id: userWallet.id },
            data: {
              balance: { increment: userProfit }, // Use increment for safety
            },
          })
        );

        // Prepare wallet transaction record
        walletTransactions.push({
          walletId: userWallet.id,
          amount: userProfit,
          type: TransactionType.CREDIT,
          status: TransactionStatus.SUCCESS,
          reference: `PROFIT-${profitLog.id}-${investor.userId}`,
          narration: `Profit from ${business.name}`,
        });
      }

      // Execute all wallet updates in parallel
      await Promise.all(walletUpdates);

      // Bulk create wallet transactions
      if (walletTransactions.length > 0) {
        await tx.walletTransaction.createMany({ data: walletTransactions });
      }

      // 2. Mark the profit log as distributed
      await tx.businessProfitLog.update({
        where: { id: profitLog.id },
        data: { distributed: true },
      });

      // 3. Log the overall profit distribution (similar to previous `distributeProfitLog`)
      const distributionLog = await tx.profitDistributionLog.create({
        data: {
          profitLogId: profitLog.id,
          reserveAmount: reserveAmount,
          userAmount: distributableAmount,
        },
      });

      return { profitLog, totalInvestorsCredited: walletTransactions.length, distributionLog };
    });

    res.status(200).json({
      message: 'Profit distributed successfully',
      profitLog: result.profitLog,
      totalInvestorsCredited: result.totalInvestorsCredited,
      distributionLog: result.distributionLog
    });
    return; // <-- FIX: Explicitly return void
  } catch (error: any) {
    console.error('Distribute Business Profit Error:', error);
    // Specific error handling for distribution
    if (error.message.includes('Business not found') ||
        error.message.includes('Business has no allocated amount')) {
      res.status(400).json({ message: error.message });
      return; // <-- FIX: Separate res.json from return
    }
    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      res.status(500).json({ message: 'Database error during distribution', error: error.message });
      return; // <-- FIX: Separate res.json from return
    }
    res.status(500).json({ message: 'Something went wrong during profit distribution', error: error.message || error });
    return; // <-- FIX: Separate res.json from return
  }
};

export const getBusinessProfitLogs = async (req: Request, res: Response) => {
  const { businessId } = req.params;

  if (!businessId) {
    res.status(400).json({ message: 'businessId is required.' });
    return; // <-- FIX: Separate res.json from return
  }

  try {
    const profitLogs = await prisma.businessProfitLog.findMany({
      where: { businessId },
      orderBy: { createdAt: 'desc' },
    });

    res.status(200).json(profitLogs);
    return; // <-- FIX: Explicitly return void
  } catch (error: any) {
    console.error('Get Business Profit Logs Error:', error);
    res.status(500).json({ message: 'Something went wrong', error: error.message || error });
    return; // <-- FIX: Explicitly return void
  }
};

export const addBusinessProfit = async (req: Request, res: Response) => {
  const { businessId, amount, notedBy } = req.body;

  if (!businessId || typeof amount !== 'number' || amount <= 0 || !notedBy) {
    res.status(400).json({ message: 'Missing fields: businessId, a positive amount, notedBy required' });
    return; // <-- FIX: Separate res.json from return
  }

  try {
    const business = await prisma.business.findUnique({ where: { id: businessId } });
    if (!business) {
      res.status(404).json({ message: 'Business not found' });
      return; // <-- FIX: Separate res.json from return
    }

    const log = await prisma.businessProfitLog.create({
      data: {
        businessId,
        amount,
        notedBy,
        distributed: false, // Default to false when logging a new profit entry
      },
    });

    res.status(200).json({ message: 'Profit logged', log });
    return; // <-- FIX: Explicitly return void
  } catch (error: any) {
    console.error('Add Business Profit Error:', error);
    res.status(500).json({ message: 'Something went wrong', error: error.message || error });
    return; // <-- FIX: Explicitly return void
  }
};