import { Worker, Job } from "bullmq";
import redis from "../../config/redis";
import { prisma } from "../../config/prisma";

export const autoInvestWorker = new Worker(
  "autoInvest",
  async (job: Job) => {
    const { cycleId } = job.data;

    const cycle = await prisma.investmentCycle.findUnique({
      where: { id: cycleId },
      select: { id: true, pricePerShareKobo: true },
    });

    if (!cycle) throw new Error("Cycle not found");

    const users = await prisma.user.findMany({
      where: {
        preferences: { autoReinvest: true },
        wallet: { isNot: null },
      },
      include: { wallet: true },
    });

    let processed = 0;

    for (const user of users) {
      try {
        if (!user.wallet) continue;

        const balance = user.wallet.balanceKobo;
        const price = cycle.pricePerShareKobo;

        if (price <= 0n) continue;

        const shares = balance / price; // BigInt division (SAFE)

        if (shares > 0n) {
          processed++;

          // TODO: call your service
          // await CycleService.purchaseShares(
          //   user.id,
          //   cycleId,
          //   Number(shares),
          //   `auto-${job.id}`
          // );
        }
      } catch (err) {
        console.error(`AutoInvest failed for user ${user.id}`, err);
      }
    }

    return { processed };
  },
  { connection: redis }
);