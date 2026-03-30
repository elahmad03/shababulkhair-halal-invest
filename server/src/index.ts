import app, { initializeApp } from "./app";
import { env } from "./config";
import { initializeSocket } from "./services/socket.service";

const PORT = env.PORT || 8000;

(async () => {
  try {
    await initializeApp();
  } catch (error) {
    console.error("❌ Failed to initialize application:", error);
    process.exit(1);
  }

  const server = app.listen(PORT, () => {
    console.log(`🚀 Server running at http://localhost:${PORT}`);
  });

  // Attach Socket.io to the http server
  initializeSocket(server);
  console.log("⚡ Socket.io initialized");

  // Graceful shutdown
  process.on("SIGINT", () => {
    console.log("👋 Server shutting down...");
    server.close(() => {
      console.log("✅ Server closed gracefully");
      process.exit(0);
    });
  });

  process.on("SIGTERM", () => {
    console.log("🛑 Termination signal received. Closing server...");
    server.close(() => {
      console.log("✅ Server closed gracefully");
      process.exit(0);
    });
  });
})();