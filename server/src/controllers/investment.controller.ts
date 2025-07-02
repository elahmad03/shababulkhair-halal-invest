import { Response, NextFunction } from 'express';
import { AuthRequest } from '../middleware/auth'; // Make sure this path is correct
import prisma from '../prisma/client';
import { Prisma } from '@prisma/client';

export const buyShares = async (
  req: AuthRequest,
  res: Response,
  // next: NextFunction // next is not used, can remove if not needed
): Promise<void> => {
  try {
    const userId = req.user?.userId;
    const { cycleId, numberOfShares } = req.body;

    // Input validation
    if (!userId || !cycleId || typeof numberOfShares !== 'number' || numberOfShares <= 0) {
      res.status(400).json({ message: 'Missing or invalid required fields' });
      return;
    }

    // Use a Prisma transaction to ensure atomicity
    await prisma.$transaction(async (tx) => {
      const cycle = await tx.cycle.findUnique({ where: { id: cycleId } });

      if (!cycle || !cycle.isOpen) {
        throw new Error('Investment cycle not found or closed');
      }

      const shareCost = 10000; // ₦10,000 per share
      const totalCost = shareCost * numberOfShares;

      const wallet = await tx.wallet.findUnique({ where: { userId } });

      if (!wallet) {
        throw new Error('User wallet not found');
      }

      if (wallet.balance < totalCost) {
        throw new Error('Insufficient wallet balance');
      }

      // Deduct funds from wallet
      await tx.wallet.update({
        where: { userId },
        data: {
          balance: { decrement: totalCost },
        },
      });

      // Upsert UserShare
      // Correct way to use composite unique key in where clause
      await tx.userShare.upsert({
        where: {
          // Now you can use the name of your composite unique constraint
          // The property name here will be the name you gave in @@unique.
          // If you named it "User_Cycle_Unique", it would be:
          User_Cycle_Unique: { // <--- THIS IS THE KEY CHANGE HERE
            userId: userId,
            cycleId: cycleId,
          },
        },
        update: {
          shares: { increment: numberOfShares },
          remainingShares: { increment: numberOfShares },
        },
        create: {
          userId,
          cycleId,
          shares: numberOfShares,
          remainingShares: numberOfShares,
          lockedUntil: new Date(new Date().setMonth(new Date().getMonth() + 6)),
        },
      });
    });

    res.status(201).json({ message: 'Shares purchased successfully' });
  } catch (error: any) {
    console.error('Buy Shares Error:', error);
    if (error.message === 'Investment cycle not found or closed' ||
        error.message === 'User wallet not found' ||
        error.message === 'Insufficient wallet balance') {
      res.status(400).json({ message: error.message });
    } else if (error instanceof Prisma.PrismaClientKnownRequestError) {
        res.status(500).json({ message: 'Database error during share purchase', details: error.message });
    }
    else {
      res.status(500).json({ message: 'Internal Server Error', details: error.message || error });
    }
  }
};