import express from "express";
import cors from "cors";
import helmet from "helmet";
import dotenv from "dotenv";
dotenv.config();
import moniepointWebhook from "./webhook/moniepoint";
import authRoutes from "./routes/auth.routes";
import walletRoutes from "./routes/wallet.routes";
import cycleRoutes from "./routes/cycle.routes";
import investmentRoutes from "./routes/investment.routes";
import businessRoutes from "./routes/business.routes";
import profitRoutes from "./routes/profit.routes";
import profilePictureRoutes from "./routes/user.routes";
import uploadKycRoutes from "./routes/kycUpload.routes";
import userRoutes from "./routes/user.routes";
// app.ts
import cron from "node-cron";
import { cleanupOrphanedImages } from "./scripts/cloudinaryCleanup";

// Run cleanup every Sunday at 2 AM
cron.schedule("0 2 * * 0", () => {
  console.log("🕐 Running scheduled Cloudinary cleanup...");
  cleanupOrphanedImages().catch(console.error);
});

const app = express();
// --- CORS Configuration ---
const allowedOrigins = [
  "http://localhost:3000", // Your Next.js frontend in development
  // Ensure this is present and uncommented:
  "https://*.ngrok-free.app", // For free ngrok domains (less secure for prod, but necessary for dynamic ngrok URLs)
  // When you deploy, add your production frontend domain(s) here:
  // 'https://your-production-frontend.com',
];

app.use(
  cors({
    origin: (origin, callback) => {
      // Allow requests with no origin (e.g., direct API calls from tools like Postman)
      if (!origin) {
        return callback(null, true);
      }

      // Check if the origin is an exact match
      if (allowedOrigins.includes(origin)) {
        return callback(null, true);
      }

      // Check for ngrok wildcard match
      const isNgrokWildcardAllowed = allowedOrigins.some(
        (allowed) =>
          allowed === "https://*.ngrok-free.app" &&
          origin.endsWith(".ngrok-free.app")
      );

      if (isNgrokWildcardAllowed) {
        return callback(null, true);
      }

      // If none of the above, block the origin
      console.log(`CORS blocked request from origin: ${origin}`); // Log this for debugging
      callback(new Error("Not allowed by CORS"));
    },
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"], // Allowed HTTP methods
    credentials: true, // Allow cookies, authorization headers, etc.
    optionsSuccessStatus: 200, // Some legacy browsers choke on 204
  })
);
// --- End CORS Configuration ---

app.use(helmet());
app.use(express.json());

// ✅ Correct: Using the Router, not a controller directly
app.use("/api/auth", authRoutes);
app.use("/api/wallet", walletRoutes);

// investments logics

app.use("/api/cycles", cycleRoutes);
// investments routes
app.use("/api/shares", investmentRoutes);

app.use("/api/businesses", businessRoutes);
app.use("/api/profit", profitRoutes);
app.use("/api/upload", profilePictureRoutes);
app.use("/api/users", userRoutes);

app.use("/api/kyc", uploadKycRoutes);

app.use("/api/webhook", moniepointWebhook);

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
