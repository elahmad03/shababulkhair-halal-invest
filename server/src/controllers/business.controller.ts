// src/controllers/business.controller.ts

import { Request, Response } from 'express';
import prisma from '../prisma/client';
import { Prisma } from '@prisma/client'; // Import Prisma for transaction types

export const createBusiness = async (req: Request, res: Response) => {
  try {
    const { cycleId, name, amountAllocated } = req.body;

    // Input validation (basic example)
    if (!cycleId || !name || typeof amountAllocated !== 'number' || amountAllocated <= 0) {
      res.status(400).json({ message: 'Invalid input data.' });
      return; // <-- FIX: Separate res.json from return
    }

    // Use a transaction for atomicity
    const result = await prisma.$transaction(async (tx) => {
      // 1. Fetch all active user shares in the cycle
      const userShares = await tx.userShare.findMany({
        where: {
          cycleId,
          remainingShares: { gt: 0 }
        },
        include: { user: true }
      });

      const totalAvailableSharesInCycle = userShares.reduce((sum, userShare) => sum + userShare.remainingShares, 0);

      if (totalAvailableSharesInCycle < amountAllocated) {
        // Throw an error to rollback the transaction
        throw new Error('Not enough total user shares in the cycle to fund business.');
      }

      // 2. Create business
      const business = await tx.business.create({
        data: {
          name,
          cycleId,
          amountAllocated,
          status: 'ACTIVE'
        }
      });

      // 3. Allocate shares to this business proportionally
      let remainingToAllocate = amountAllocated;
      const investorsToCreate: Prisma.BusinessInvestorCreateManyInput[] = [];
      // Use a map to track the final remaining shares for each userShare ID
      const finalUserShareRemaining: Map<string, number> = new Map();

      // Sort userShares to ensure consistent allocation (e.g., by ID)
      // This helps with deterministic distribution of 'dust' amounts
      userShares.sort((a, b) => a.id.localeCompare(b.id)); // Assuming ID is a string

      for (const userShare of userShares) {
        if (remainingToAllocate <= 0) break; // Stop if nothing left to allocate

        // Calculate proportional share
        const percentage = totalAvailableSharesInCycle > 0 ? userShare.remainingShares / totalAvailableSharesInCycle : 0;
        let shareAmount = amountAllocated * percentage; // Base allocation based on initial total

        // Cap the shareAmount by the user's remaining shares
        shareAmount = Math.min(userShare.remainingShares, shareAmount);

        // Ensure we don't over-allocate the business's amount
        shareAmount = Math.min(remainingToAllocate, shareAmount);

        // A small threshold to avoid floating point issues or allocating tiny dust amounts
        if (shareAmount > 0.0001) { // Reduced threshold for precision
          investorsToCreate.push({
            userId: userShare.userId,
            businessId: business.id,
            amount: shareAmount,
            sharesUsed: shareAmount // 'sharesUsed' is the amount allocated for this business
          });

          // Store the updated remaining shares for this user
          finalUserShareRemaining.set(userShare.id, userShare.remainingShares - shareAmount);
          remainingToAllocate -= shareAmount;
        } else {
            // If shareAmount is too small, just ensure it's recorded as original for no change
            finalUserShareRemaining.set(userShare.id, userShare.remainingShares);
        }
      }

      // 4. Distribute any remaining 'dust' amount due to rounding
      // This ensures the `amountAllocated` for the business is fully used.
      if (remainingToAllocate > 0.0001 && investorsToCreate.length > 0) {
        // Find the investor who received the most proportionally, or simply the first one
        // and add the remaining dust to their allocated amount.
        // It iterates over existing investors to add remaining dust, prioritizing those who can take more
        for (let i = 0; i < investorsToCreate.length && remainingToAllocate > 0.0001; i++) {
            const investor = investorsToCreate[i];
            const originalUserShare = userShares.find(us => us.userId === investor.userId);

            if (originalUserShare) {
                // Determine how much more this investor *could* receive based on their original remainingShares
                const availableToTakeFromOriginal = originalUserShare.remainingShares - investor.amount;
                const amountToAddToInvestor = Math.min(remainingToAllocate, availableToTakeFromOriginal);

                if (amountToAddToInvestor > 0) {
                    investor.amount += amountToAddToInvestor;
                    investor.sharesUsed += amountToAddToInvestor; // Update sharesUsed too
                    finalUserShareRemaining.set(
                        originalUserShare.id,
                        originalUserShare.remainingShares - investor.amount // Recalculate
                    );
                    remainingToAllocate -= amountToAddToInvestor;
                }
            }
        }
        // If still remaining after iterating through all (e.g., all others couldn't take more),
        // just add the last bit to the first valid investor to ensure full allocation.
        if (remainingToAllocate > 0.0001 && investorsToCreate.length > 0) {
            const firstInvestor = investorsToCreate[0];
            const originalFirstUserShare = userShares.find(us => us.userId === firstInvestor.userId);
             if (originalFirstUserShare) {
                firstInvestor.amount += remainingToAllocate;
                firstInvestor.sharesUsed += remainingToAllocate;
                 finalUserShareRemaining.set(
                    originalFirstUserShare.id,
                    originalFirstUserShare.remainingShares - firstInvestor.amount
                );
                remainingToAllocate = 0; // Fully allocated
            }
        }
      }


      // 5. Prepare UserShare update promises based on the final calculated remaining shares
      const userShareUpdates = userShares.map(userShare => {
        const newRemaining = finalUserShareRemaining.get(userShare.id);
        // Only update if there's an actual change recorded or if it's new in the map
        if (newRemaining !== undefined && newRemaining !== userShare.remainingShares) {
          return tx.userShare.update({
            where: { id: userShare.id },
            data: { remainingShares: newRemaining }
          });
        }
        return Promise.resolve(); // Return a resolved promise for no-op updates
      }).filter(promise => promise); // Filter out resolved promises if no update was needed

      // Execute all userShare updates in parallel within the transaction
      await Promise.all(userShareUpdates);

      // Create all business investor records
      await tx.businessInvestor.createMany({
        data: investorsToCreate
      });

      return business; // Return the created business to the outer scope
    });

    res.status(201).json({ message: 'Business created and shares allocated', business: result });
    return; // <-- FIX: Explicitly return void
  } catch (error: any) { // Explicitly type error as any
    console.error('Create Business Error:', error);
    // Check if it's a PrismaClientKnownRequestError for more specific handling
    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      if (error.code === 'P2002') { // Unique constraint violation (e.g., if business name/cycle combination is unique)
        res.status(409).json({ message: 'A business with this name already exists in the cycle.', error: error.message });
        return; // <-- FIX: Separate res.json from return
      }
      // Handle other known Prisma errors
      res.status(500).json({ message: 'Database error occurred', error: error.message });
      return; // <-- FIX: Separate res.json from return
    }
    // Handle custom errors thrown within the transaction
    if (error.message.includes('Not enough total user shares')) {
        res.status(400).json({ message: error.message });
        return; // <-- FIX: Separate res.json from return
    }
    res.status(500).json({ message: 'Something went wrong', error: error.message || error });
    return; // <-- FIX: Separate res.json from return
  }
};


// ✅ Log Profit for a Business
export const addBusinessProfit = async (req: Request, res: Response) => {
  try {
    const { businessId, amount, notedBy } = req.body;

    if (!businessId || typeof amount !== 'number' || amount <= 0 || !notedBy) {
        res.status(400).json({ message: 'Invalid input data for adding profit.' });
        return; // <-- FIX: Separate res.json from return
    }

    const business = await prisma.business.findUnique({ where: { id: businessId } });
    if (!business) {
      res.status(404).json({ message: 'Business not found' });
      return; // <-- FIX: Separate res.json from return
    }

    const log = await prisma.businessProfitLog.create({
      data: {
        businessId,
        amount,
        notedBy
      }
    });

    res.status(200).json({ message: 'Profit logged', log });
    return; // <-- FIX: Explicitly return void
  } catch (error: any) {
    console.error('Add Business Profit Error:', error);
    res.status(500).json({ message: 'Something went wrong', error: error.message || error });
    return; // <-- FIX: Explicitly return void
  }
};

// ✅ Distribute Profit Log to Investors
export const distributeProfitLog = async (req: Request, res: Response) => {
  const { profitLogId } = req.body;

  if (!profitLogId) {
      res.status(400).json({ message: 'Profit Log ID is required.' });
      return; // <-- FIX: Separate res.json from return
  }

  try {
    const result = await prisma.$transaction(async (tx) => {
      const profitLog = await tx.businessProfitLog.findUnique({
        where: { id: profitLogId },
        include: {
          business: {
            include: { investors: true }
          }
        }
      });

      if (!profitLog) {
        throw new Error('Profit log not found.'); // Throw error for transaction rollback
      }
      if (profitLog.distributed) {
        throw new Error('Profit log already distributed.'); // Throw error for transaction rollback
      }

      const business = profitLog.business;
      // Handle case where business or investors might be null/empty after queries
      if (!business || !business.investors || business.investors.length === 0) {
        throw new Error('Business or investors not found for this profit log.');
      }

      const totalAllocated = business.investors.reduce((sum: number, inv) => sum + inv.amount, 0);

      // Handle totalAllocated being zero to prevent division by zero
      if (totalAllocated === 0) {
        throw new Error('No investments found for this business to distribute profit.');
      }

      // Ensure amount is positive before calculating reserve and distributable
      if (profitLog.amount <= 0) {
        throw new Error('Profit amount must be positive for distribution.');
      }

      const reserve = profitLog.amount * 0.3;
      const distributable = profitLog.amount * 0.7;

      const walletUpdates: Promise<any>[] = [];
      const txs: Prisma.WalletTransactionCreateManyInput[] = [];

      for (const investor of business.investors) {
        // Ensure investor.amount is not zero to prevent NaN or Infinity
        // Also ensure totalAllocated is not zero, which is checked above.
        const percent = (investor.amount / totalAllocated); // Calculate percentage of investment
        const userProfit = distributable * percent;

        // Fetch wallet within the transaction context
        const wallet = await tx.wallet.findUnique({ where: { userId: investor.userId } });
        if (!wallet) {
          console.warn(`Wallet not found for user ID: ${investor.userId}. Skipping profit distribution for this investor.`);
          continue; // Skip this investor if wallet not found, but log it
        }

        walletUpdates.push(
          tx.wallet.update({
            where: { id: wallet.id }, // Use wallet.id for update where clause
            data: { balance: wallet.balance + userProfit }
          })
        );

        txs.push({
          walletId: wallet.id,
          amount: userProfit,
          type: 'CREDIT',
          status: 'SUCCESS',
          reference: `PROFIT-${profitLog.id}-${investor.userId}`,
          narration: `Profit from ${business.name}`
        });
      }

      // Execute all wallet updates in parallel within the transaction
      await Promise.all(walletUpdates);

      // Create all wallet transactions
      if (txs.length > 0) { // Only create if there are transactions to prevent empty array errors
        await tx.walletTransaction.createMany({ data: txs });
      }

      // Update profit log status
      await tx.businessProfitLog.update({
        where: { id: profitLog.id },
        data: { distributed: true }
      });

      // Log the profit distribution
      const distributionLog = await tx.profitDistributionLog.create({
        data: {
          profitLogId: profitLog.id,
          reserveAmount: reserve,
          userAmount: distributable
        }
      });

      return { txCount: txs.length, distributionLog };
    });

    res.status(200).json({ message: 'Profit distributed successfully', txCount: result.txCount, distributionLog: result.distributionLog });
    return; // <-- FIX: Explicitly return void
  } catch (error: any) {
    console.error('Distribute Profit Log Error:', error);
    // Specific error handling for distribution
    if (error.message.includes('Profit log not found') || error.message.includes('already distributed') || error.message.includes('No investments found') || error.message.includes('Profit amount must be positive')) {
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