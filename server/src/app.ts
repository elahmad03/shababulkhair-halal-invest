import express from "express";
import { Request, Response, NextFunction } from "express";
import helmet from "helmet";
import cors from "cors";
import morgan from "morgan";
import rateLimit from "express-rate-limit";
import compression from "compression";
import { errorHandler } from "./common/middleware/errorHandler";
import { env } from "./config";
import cookieParser from "cookie-parser";
import redis from "./config/redis";
import authRoutes from "./modules/auth/auth.routes";
import kycRoutes from "./modules/kyc/kyc.routes";
import paystackWebhookRoutes from "./modules/wallet/wallet.routes";
import walletRoutes from "./modules/wallet/wallet.routes";
import cycleRoutes from "./modules/investment/cycle.routes";
// Rate limiter – protects against brute-force & basic DDoS
const limiter = rateLimit({
  windowMs: env.RATE_LIMIT_WINDOW_MINUTES * 60 * 1000,
  max: env.RATE_LIMIT_MAX,
  message: { error: "Too many requests from this IP, please try again later." },
  standardHeaders: true, 
  legacyHeaders: false,
});

// Create Express app
const app = express();

// 1. Security headers – FIRST thing
app.use(
  helmet({
    crossOriginResourcePolicy: { policy: "cross-origin" },
  })
);


// 2. CORS – handle preflight early
const allowedOrigins = env.CLIENT_ORIGIN.split(",").map((origin: string) => origin.trim());

app.use(
  cors({
    origin: (origin, callback) => {
      // Allow requests with no origin (like mobile apps or curl)
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        callback(new Error("Not allowed by CORS"));
      }
    },
    credentials: true, 
    methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);

// 3. Trust proxy (important behind Nginx, Render, Vercel, Cloudflare, etc.)
app.set("trust proxy", 1);

// 4. Rate limiting – early to reject bad traffic cheap
app.use(limiter);

// 5. Compression – gzip/brotli responses (huge bandwidth saver)
app.use(compression());
app.use("/api/v1/webhook", paystackWebhookRoutes,
  express.raw({ type: "application/json" })
)
// 6. Body parsers
app.use(express.json({ limit: "10mb" })); // Adjust limit as needed
app.use(express.urlencoded({ extended: false }));

// 7. Cookie parser
app.use(cookieParser());
// 8. Logging – use 'dev' in development, 'combined' in production
const logFormat = env.NODE_ENV === "production" ? "combined" : "dev";
app.use(morgan(logFormat));

app.get("/", (_req: Request, res: Response) => {
  res.send(
    "Welcome to shababukhair API - Version 1.0.0. Visit /api/v1 for endpoints."
  );
});
export async function initializeApp() :Promise<boolean>{
  try {
    await redis.ping();
    console.log("✅ Redis connected successfully");
    return true;
  } catch (err) {
    console.error("❌ Redis connection failed:", err);
    return false;
    
  }
}



// Health checks
app.get("/health", (_req, res) => {
  res.status(200).json({
    status: "ok",
    uptime: process.uptime(),
    timestamp: new Date().toISOString(),
    environment: env.NODE_ENV,
  });
});
const api="/api/v1/"
// API routes – versioned & modular
app.use("/api/v1/auth", authRoutes);
app.use(api+"kyc",kycRoutes)

app.use(api+"wallet", walletRoutes);
app.use(api+"cycles", cycleRoutes);

// Global error handler – ALWAYS last
app.use(errorHandler);

export default app;