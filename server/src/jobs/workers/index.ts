import { kycAuditWorker, kycCleanupWorker } from "./kyc.worker";

const workers = [kycCleanupWorker, kycAuditWorker];

const shutdown = async () => {
  console.log("[workers] Graceful shutdown initiated...");

  const SHUTDOWN_TIMEOUT_MS = 30000; // 30 seconds
  const closePromises = workers.map((w) => w.close());

  try {
    await Promise.race([
      Promise.all(closePromises),
      new Promise((_, reject) =>
        setTimeout(
          () => reject(new Error("Shutdown timeout")),
          SHUTDOWN_TIMEOUT_MS,
        ),
      ),
    ]);
  } catch (err) {
    console.error("[workers] Shutdown error or timeout:", err);
    // Force exit after timeout
  }

  console.log("[workers] All workers closed.");
  process.exit(0);
};

process.on("SIGTERM", shutdown);
process.on("SIGINT", shutdown);
