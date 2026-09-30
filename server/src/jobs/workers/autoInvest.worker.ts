/**
 * autoInvest.worker.ts
 *
 * Processes the "autoInvest" BullMQ queue.
 *
 * Triggered when: a new InvestmentCycle transitions to OPEN_FOR_INVESTMENT.
 *
 * For every ACTIVE user whose preferences.autoReinvest === true:
 *   1. Read their liquid wallet balance
 *   2. Calculate how many shares they can afford (integer BigInt division)
 *   3. Call CycleService.purchaseShares with a stable per-user idempotency key
 *      so a retried job never double-invests
 *
 * Security guarantees:
 *   - Idempotency key = `auto-invest:{jobId}:{userId}` — unique per job+user
 *   - purchaseShares runs inside a Serializable DB transaction — no race conditions
 *   - purchaseShares validates cycle status before deducting — safe if cycle
 *     was closed between job enqueue and execution
 *   - Per-user errors are caught and logged; one user failing never stops others
 *   - Worker concurrency = 1 per BullMQ job to prevent overlapping runs for same
 *     cycleId (BullMQ handles this at the queue level via job deduplication key)
 */

import { Worker, Job } from "bullmq";
import CycleService from "../../modules/cycles/cycle.service";
import { prisma } from "../../config/prisma";
import { bullmqRedis } from "../../config/redis";

interface AutoInvestJobData {
  cycleId: string;
}

export const autoInvestWorker = new Worker<AutoInvestJobData>(
  "autoInvest",
  async (job: Job<AutoInvestJobData>) => {
    const { cycleId } = job.data;

    // Verify cycle is still open before doing any per-user work
    const cycle = await prisma.investmentCycle.findUnique({
      where: { id: cycleId },
      select: { id: true, pricePerShareKobo: true, status: true, cycleName: true },
    });

    if (!cycle) {
      console.warn(`[AutoInvest] Cycle ${cycleId} not found — skipping job`);
      return { processed: 0, skipped: 0, errors: 0 };
    }

    if (cycle.status !== "OPEN_FOR_INVESTMENT") {
      console.warn(
        `[AutoInvest] Cycle ${cycleId} is no longer OPEN_FOR_INVESTMENT (status: ${cycle.status}) — skipping`
      );
      return { processed: 0, skipped: 0, errors: 0 };
    }

    if (cycle.pricePerShareKobo <= 0n) {
      console.error(`[AutoInvest] Cycle ${cycleId} has invalid pricePerShareKobo — aborting`);
      return { processed: 0, skipped: 0, errors: 0 };
    }

    // Fetch all users who have opted in and have a wallet
    const users = await prisma.user.findMany({
      where: {
        status: "ACTIVE",
        preferences: { autoReinvest: true },
        wallet: { isNot: null },
      },
      select: {
        id: true,
        wallet: { select: { balanceKobo: true } },
      },
    });

    let processed = 0;
    let skipped = 0;
    let errors = 0;

    for (const user of users) {
      try {
        const balance = user.wallet?.balanceKobo ?? 0n;
        const price = cycle.pricePerShareKobo;

        // Integer division — how many whole shares can they afford?
        const shares = balance / price;

        if (shares <= 0n) {
          skipped++;
          continue;
        }

        // Stable idempotency key: same job + same user always maps to the same key
        // If the job is retried, purchaseShares returns the cached result — no double-invest
        const idempotencyKey = `auto-invest:${job.id}:${user.id}`;

        await CycleService.purchaseShares(
          user.id,
          cycleId,
          Number(shares),
          idempotencyKey
        );

        processed++;
        console.info(
          `[AutoInvest] ✅ Invested ${shares} share(s) for user ${user.id} in cycle ${cycle.cycleName}`
        );
      } catch (err) {
        // Per-user error — log and continue; never abort the whole job
        errors++;
        console.error(
          `[AutoInvest] ❌ Failed for user ${user.id} in cycle ${cycleId}:`,
          err instanceof Error ? err.message : err
        );
      }
    }

    console.info(
      `[AutoInvest] Job ${job.id} done — processed: ${processed}, skipped: ${skipped}, errors: ${errors}`
    );

    return { processed, skipped, errors };
  },
  {
    connection: bullmqRedis,
    // One concurrent job at a time — prevents two runs from racing on the same cycle
    concurrency: 1,
  }
);

autoInvestWorker.on("failed", (job, err) => {
  console.error(`[AutoInvest] Job ${job?.id} permanently failed:`, err.message);
});