import type { RequestHandler } from 'express';
import { env } from '../../config';

type Entry = {
  count: number;
  resetAt: number;
};

const store = new Map<string, Entry>();

const WINDOW_MS = env.RATE_LIMIT_WINDOW_MINUTES;
const MAX_REQUESTS = env.RATE_LIMIT_MAX;

export const rateLimit: RequestHandler = (req, res, next) => {
  if (env.NODE_ENV !== "production" || !env.RATE_LIMIT_ENABLED) {
    next();
    return;
  }

  try {
    const ip =
      req.ip ||
      req.headers["x-forwarded-for"]?.toString() ||
      "unknown";

    const now = Date.now();
    const entry = store.get(ip);

    if (!entry || entry.resetAt < now) {
      store.set(ip, {
        count: 1,
        resetAt: now + WINDOW_MS,
      });
      next();
      return;
    }

    if (entry.count >= MAX_REQUESTS) {
      res.status(429).json({
        status: 429,
        error: "Too many requests. Try again later.",
      });
      return;
    }

    entry.count += 1;
    next();
  } catch {
    next();
  }
};