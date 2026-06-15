import { Queue } from "bullmq";
import { bullmqRedis } from "../../config/redis";

const defaultJobOptions = {
  removeOnComplete: 100,
  removeOnFail: 1000,
  backoff: {
    type: "exponential" as const,
    delay: 3000,
  },
};

// ─── KYC Cleanup Queue ────────────────────────────────────────────────────────
// Destroys old Cloudinary assets when a user re-submits KYC.

export type KycCleanupJobData = {
  userId: string;
};

export const kycCleanupQueue = new Queue<KycCleanupJobData>("kycCleanup", {
  connection: bullmqRedis,
  defaultJobOptions: {
    ...defaultJobOptions,
    attempts: 5,
  },
});

// ─── KYC Audit Log Queue ──────────────────────────────────────────────────────
// Writes audit log entries without blocking the main request path.

export type KycAuditJobData = {
  action: "VIEW_PENDING" | "VIEW_DETAIL" | "APPROVE" | "REJECT";
  actorId: string;
  kycId?: string;
  meta?: Record<string, unknown>;
};

export const kycAuditQueue = new Queue<KycAuditJobData>("kycAudit", {
  connection: bullmqRedis,
  defaultJobOptions: {
    ...defaultJobOptions,
    attempts: 3, // audit logs are less critical than asset cleanup
  },
});