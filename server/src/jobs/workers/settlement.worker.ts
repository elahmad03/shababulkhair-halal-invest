import { Worker, Job } from 'bullmq';
import redis from '../../config/redis';
import { prisma } from '../../config/prisma';

export const settlementWorker = new Worker(
  'settlement',
  async (job: Job) => {
    const { cycleId } = job.data;
    // Find all investments for this cycle
    const investments = await prisma.shareholderInvestment.findMany({ where: { cycleId } });
    for (const inv of investments) {
      // TODO: Settle capital and profit for each investor
      // await CycleService.settleInvestment(inv.id);
    }
    return { processed: investments.length };
  },
  { connection: redis }
);
