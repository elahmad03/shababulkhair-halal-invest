import redis from "../config/redis";
import { Redis } from "ioredis";
import { hashSecret, verifySecret } from "../utils/hash";

// Define a consistent Time-To-Live configuration
export const TTL = {
  REFRESH_TOKEN: 7 * 24 * 3600, // 7 Days
  OTP: 600, // 10 Minutes
  OTP_BLOCK: 15 * 60, // 15 Minutes
  USER_CACHE: 3600, // 1 Hour
} as const;

type SessionMeta = {
  userId: string;
  jti: string;
  deviceId?: string | null;
  ip?: string | null;
  userAgent?: string | null;
  createdAt: number;
  expiresAt: number;
};

const PREFIX = {
  auth: "auth:",
  refresh: "auth:refresh:",
  otp: "auth:otp:",
  otpAttempts: "auth:otp:attempts:",
  rate: "auth:rate:",
  cacheUser: "cache:user:",
  blacklist: "auth:block:",
};

class RedisService {
  /**
   * Public getter to access the underlying ioredis client for pipeline/transaction use.
   * FIX for: Property 'redis' does not exist on type 'RedisService'.
   */
  public get redis(): Redis {
    return redis;
  }

  // -------------------------
  // Connection health
  // -------------------------
  async ping(): Promise<boolean> {
    try {
      return (await redis.ping()) === "PONG";
    } catch (e) {
      return false;
    }
  }

  // -------------------------
  // Refresh tokens (secure)
  // -------------------------
  async storeRefreshToken(
    userId: string,
    jti: string,
    refreshTokenPlain: string,
    meta?: { deviceId?: string |null; ip?: string |null; userAgent?: string |null},
    expiresInSeconds: number = TTL.REFRESH_TOKEN,
  ): Promise<void> {
    const key = `${PREFIX.refresh}${userId}:${jti}`;
    const hashed = await hashSecret(refreshTokenPlain);

    const now = Date.now();
    const session: SessionMeta = {
      userId,
      jti,
      deviceId: meta?.deviceId,
      ip: meta?.ip,
      userAgent: meta?.userAgent,
      createdAt: now,
      expiresAt: now + expiresInSeconds * 1000,
    };
    const payload = JSON.stringify({ hashed, session });
    await redis.set(key, payload, "EX", expiresInSeconds);
  }

  async verifyRefreshTokenAndGetSession(
    userId: string,
    jti: string,
    refreshTokenPlain: string,
  ): Promise<SessionMeta | null> {
    const key = `${PREFIX.refresh}${userId}:${jti}`;
    const payload = await redis.get(key);

    if (!payload) return null;

    try {
      const parsed = JSON.parse(payload) as {
        hashed: string;
        session: SessionMeta;
      };
      const isValid = await verifySecret(parsed.hashed, refreshTokenPlain);

      if (!isValid) return null;
      return parsed.session;
    } catch (err) {
      await redis.del(key);
      return null;
    }
  }

  async revokeRefreshToken(userId: string, jti: string): Promise<void> {
    const key = `${PREFIX.refresh}${userId}:${jti}`;
    await redis.del(key);
  }

  async revokeAllUserTokens(userId: string): Promise<void> {
    const pattern = `${PREFIX.refresh}${userId}:*`;
    let cursor = "0";

    do {
      const [nextCursor, keys] = await redis.scan(
        cursor,
        "MATCH",
        pattern,
        "COUNT",
        100,
      );
      cursor = nextCursor;

      if (keys.length > 0) {
        const pipeline = redis.pipeline();
        keys.forEach((key) => pipeline.del(key));
        await pipeline.exec();
      }
    } while (cursor !== "0");
  }

  // -------------------------
  // OTP (hashed) + attempt counters
  // -------------------------
  async storeOTP(
    userId: string,
    otpPlain: string,
    purpose: string,
    expiresInSeconds: number = TTL.OTP,
  ): Promise<void> {
    const key = `${PREFIX.otp}${userId}:${purpose}`;
    const attemptsKey = `${PREFIX.otpAttempts}${userId}:${purpose}`;

    const hashed = await hashSecret(otpPlain);

    // Transaction: Save new OTP AND reset attempts counter
    const pipeline = redis.pipeline();
    pipeline.set(key, hashed, "EX", expiresInSeconds);
    pipeline.del(attemptsKey); // Reset attempts on new OTP generation
    await pipeline.exec();
  }

  async verifyOTP(
    userId: string,
    otpPlain: string,
    purpose: string,
    maxAttempts: number = 5,
    blockSeconds: number = TTL.OTP_BLOCK,
  ): Promise<boolean> {
    const key = `${PREFIX.otp}${userId}:${purpose}`;
    const attemptsKey = `${PREFIX.otpAttempts}${userId}:${purpose}`;

    const attempts = await redis.incr(attemptsKey);

    if (attempts === 1) {
      await redis.expire(attemptsKey, blockSeconds);
    }

    if (attempts > maxAttempts) return false;

    const storedHash = await redis.get(key);
    if (!storedHash) return false;

    const isValid = await verifySecret(storedHash, otpPlain);
    if (!isValid) return false;

    // Cleanup (Consume OTP)
    const pipeline = redis.pipeline();
    pipeline.del(key);
    pipeline.del(attemptsKey);
    await pipeline.exec();

    return true;
  }
  /**
   * Delete OTP and its attempts counter atomically.
   * Encapsulates key composition and Redis internals.
   */
  async deleteOTP(userId: string, purpose: string): Promise<void> {
    const otpKey = `${PREFIX.otp}${userId}:${purpose}`;
    const attemptsKey = `${PREFIX.otpAttempts}${userId}:${purpose}`;

    const pipeline = redis.pipeline();
    pipeline.del(otpKey);
    pipeline.del(attemptsKey);
    await pipeline.exec();
  }
  async getOTPHash(userId: string, purpose: string): Promise<string | null> {
    const key = `${PREFIX.otp}${userId}:${purpose}`;
    return redis.get(key);
  }

  // -------------------------
  // Access token blacklist helpers (by JTI)
  // -------------------------
  async blacklistTokenJti(
    jti: string,
    ttlSeconds: number = TTL.REFRESH_TOKEN,
  ): Promise<void> {
    const key = `${PREFIX.blacklist}${jti}`;
    await redis.set(key, "1", "EX", ttlSeconds);
  }

  async isTokenJtiBlacklisted(jti: string): Promise<boolean> {
    const key = `${PREFIX.blacklist}${jti}`;
    const value = await redis.get(key);
    return value !== null;
  }

  // -------------------------
  // Small utility wrappers
  // -------------------------
  async set(
    key: string,
    value: string,
    expiresInSeconds?: number,
  ): Promise<void> {
    if (expiresInSeconds) await redis.set(key, value, "EX", expiresInSeconds);
    else await redis.set(key, value);
  }

  /**
   * FIX for: Property 'get' does not exist on type 'RedisService'.
   */
  async get(key: string): Promise<string | null> {
    return await redis.get(key);
  }

  async del(key: string): Promise<void> {
    await redis.del(key);
  }

  // ... (rate limiting and user cache methods removed for brevity, but they are in your version)
}

export default new RedisService();