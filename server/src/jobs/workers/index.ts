import { kycAuditWorker, kycCleanupWorker } from "./kyc.worker";


const workers = [kycCleanupWorker, kycAuditWorker];

const shutdown = async () => {
  console.log("[workers] Graceful shutdown initiated...");
  await Promise.all(workers.map((w) => w.close()));
  console.log("[workers] All workers closed.");
  process.exit(0);
};

process.on("SIGTERM", shutdown);
process.on("SIGINT", shutdown);