import express from "express";
import { Request, Response } from "express";
import helmet from "helmet";
import cors from "cors";
import morgan from "morgan";
import rateLimit from "express-rate-limit";
import compression from "compression";
import cookieParser from "cookie-parser";

import { errorHandler } from "./common/middleware/errorHandler";
import { env } from "./config";
import redis from "./config/redis";

import authRoutes from "./modules/auth/auth.routes";
import kycRoutes from "./modules/kyc/kyc.routes";
import walletRoutes from "./modules/wallet/wallet.routes";
import paystackWebhookRoutes from "./modules/wallet/wallet.routes"; // ✅ must be a separate file/router
import ventureRoutes from "./modules/venture/venture.routes";
import cycleRoutes from "./modules/cycles/cycle.routes";
import userRoutes from "./modules/user/user.routes";

// ─── Create app ───────────────────────────────────────────────────────────────
const app = express();

// 1. Trust proxy — MUST be first so rate limiter & logs see real client IP
app.set("trust proxy", 1);

// 2. Security headers
app.use(
  helmet({
    crossOriginResourcePolicy: { policy: "cross-origin" },
  })
);

// 3. CORS — handle preflight early
const allowedOrigins = new Set(
  env.CLIENT_ORIGIN
    .split(",")
    .map((o) => o.trim().replace(/\/$/, ""))
);

app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin) return callback(null, true); // allow non-browser clients

      const clean = origin.replace(/\/$/, "");

      if (allowedOrigins.has(clean)) return callback(null, true);

      return callback(new Error(`CORS blocked: ${clean}`));
    },
    credentials: true,
  })
);

// 4. Rate limiting — reject bad traffic before touching body parsers
const limiter = rateLimit({
  windowMs: env.RATE_LIMIT_WINDOW_MINUTES * 60 * 1000,
  max: env.RATE_LIMIT_MAX,
  message: { error: "Too many requests from this IP, please try again later." },
  standardHeaders: true,
  legacyHeaders: false,
});
app.use(limiter);

// 5. Compression
app.use(compression());

// 6. Webhook route — raw body MUST be parsed before the route handler
//    and BEFORE the global express.json() middleware strips the raw buffer
app.use(
  "/api/v1/webhook",
  express.raw({ type: "application/json" }),
  paystackWebhookRoutes
);

// 7. Body parsers (applied after webhook so raw body is preserved there)
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: false }));

// 8. Cookie parser
app.use(cookieParser());

// 9. Request logging
const logFormat = env.NODE_ENV === "production" ? "combined" : "dev";
app.use(morgan(logFormat));

// ─── Base routes ──────────────────────────────────────────────────────────────
app.get("/", (_req: Request, res: Response) => {
  res.send(
    "Welcome to shababukhair API - Version 1.0.0. Visit /api/v1 for endpoints."
  );
});

app.get("/health", (_req, res) => {
  res.status(200).json({
    status: "ok",
    uptime: process.uptime(),
    timestamp: new Date().toISOString(),
    environment: env.NODE_ENV,
  });
});

// ─── API routes ───────────────────────────────────────────────────────────────
const API = "/api/v1";

app.use(`${API}/auth`, authRoutes);
app.use(`${API}/kyc`, kycRoutes);
app.use(`${API}/wallet`, walletRoutes);
app.use(`${API}/cycles`, cycleRoutes);
app.use(`${API}/ventures`, ventureRoutes);
app.use(`${API}/users`, userRoutes);

// ─── Global error handler — MUST be last ─────────────────────────────────────
app.use(errorHandler);

// ─── Redis init ───────────────────────────────────────────────────────────────
export async function initializeApp(): Promise<boolean> {
  try {
    await redis.ping();
    console.log("✅ Redis connected successfully");
    return true;
  } catch (err) {
    console.error("❌ Redis connection failed:", err);
    return false;
  }
}

export default app;