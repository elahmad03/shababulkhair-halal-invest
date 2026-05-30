import { Worker, Job } from "bullmq";
import cloudinary from "../../config/cloudinary";
import { prisma } from "../../config/prisma";
import type { KycCleanupJobData, KycAuditJobData } from "../queues/kyc.queue";
import { bullmqRedis } from "../../config/redis";

// ─── KYC Cleanup Worker ───────────────────────────────────────────────────────

async function destroyOldKycAssets(userId: string): Promise<void> {
  const types: Array<"front" | "back" | "avatar"> = ["front", "back", "avatar"];

  const results = await Promise.allSettled(
    types.map((type) =>
      cloudinary.uploader.destroy(`kyc/${userId}/${type}`, {
        type: "authenticated",
        invalidate: true,
      })
    )
  );

  // Surface any hard failures so BullMQ can retry the job
  const failures = results.filter((r) => r.status === "rejected");
  if (failures.length > 0) {
    const reasons = failures
      .map((f) => (f as PromiseRejectedResult).reason)
      .join(", ");
    throw new Error(`Some Cloudinary deletions failed: ${reasons}`);
  }
}

export const kycCleanupWorker = new Worker<KycCleanupJobData>(
  "kycCleanup",
  async (job: Job<KycCleanupJobData>) => {
    const { userId } = job.data;
    await destroyOldKycAssets(userId);
  },
  {
    connection: bullmqRedis,
    concurrency: 5,
  }
);

kycCleanupWorker.on("completed", (job) => {
  console.log(`[kyc-cleanup] Job ${job.id} completed for user ${job.data.userId}`);
});

kycCleanupWorker.on("failed", (job, err) => {
  console.error(`[kyc-cleanup] Job ${job?.id} failed for user ${job?.data.userId}:`, err.message);
});

// ─── KYC Audit Log Worker ─────────────────────────────────────────────────────

export const kycAuditWorker = new Worker<KycAuditJobData>(
  "kycAudit",
  async (job: Job<KycAuditJobData>) => {
    const { action, actorId, kycId, meta } = job.data;

    await prisma.kycAuditLog.create({
      data: {
        action,
        actorId,
        kycId: kycId ?? null,
        meta: meta ? JSON.stringify(meta, (key, value) => {
          // Strip non-serializable values
          if (typeof value === 'function' || typeof value === 'symbol') return undefined;
          return value;
        }) : null,
      },
    });
  },
  {
    connection: bullmqRedis,
    concurrency: 10, // audit writes are cheap — higher concurrency is fine
  }
);

kycAuditWorker.on("completed", (job) => {
  console.log(`[kyc-audit] Job ${job.id} completed — action: ${job.data.action}`);
});

kycAuditWorker.on("failed", (job, err) => {
  console.error(`[kyc-audit] Job ${job?.id} failed — action: ${job?.data.action}:`, err.message);
});