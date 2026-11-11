import { Worker, Job } from 'bullmq';
import { bullmqRedis } from '../../config/redis';
import { prisma } from '../../config/prisma';
import { TransactionType, TransactionStatus } from '@prisma/client';

export const settlementWorker = new Worker(
  'settlement',
  async (job: Job) => {
    const { cycleId } = job.data;
    const cycle = await prisma.investmentCycle.findUnique({
      where: { id: cycleId },
      include: { investments: true },
    });

    if (!cycle) return { processed: 0 };

    let processed = 0;
    for (const inv of cycle.investments) {
      if (inv.amountInvestedKobo > 0n) {
        await prisma.$transaction(async (tx) => {
          await tx.wallet.update({
            where: { userId: inv.userId },
            data: {
              lockedBalanceKobo: { decrement: inv.amountInvestedKobo },
              balanceKobo: { increment: inv.amountInvestedKobo },
            },
          });

          await tx.transaction.create({
            data: {
              userId: inv.userId,
              transactionType: TransactionType.CAPITAL_RETURN,
              amountKobo: inv.amountInvestedKobo,
              transactionStatus: TransactionStatus.COMPLETED,
              narration: `Capital return from settled cycle: ${cycle.cycleName}`,
              relatedEntityType: "INVESTMENT_CYCLE",
              relatedEntityId: cycleId,
            },
          });
        });
        processed++;
      }
    }
    return { processed };
  },
  { connection: bullmqRedis }
);
