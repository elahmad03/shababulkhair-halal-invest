
import { randomInt } from "crypto";
// Ensure correct path to your RedisService
import RedisService, { TTL } from "../../services/redis.service"; 
  import { OtpPurpose } from "./auth.validation";
import { env } from "../../config";
// --- Constants ---
const OTP_MAX_ATTEMPTS = env.RATE_LIMIT_MAX;

/**
 * Generate secure numeric OTP
 */
export function generateOTP(length = 6): string {
  const max = 10 ** length;
  const val = randomInt(0, max);
  return val.toString().padStart(length, "0");
}

// --- Service Functions ---

/**
 * Saves a new OTP using the RedisService.
 * @returns The raw OTP, which must be sent to the user.
 */
export async function saveOTP(
  userId: string,
  purpose: OtpPurpose = "EMAIL_VERIFICATION"
): Promise<string> {
  const otp = generateOTP();
  
  await RedisService.storeOTP(
    userId,
    otp,
    purpose,
    TTL.OTP 
  );
  
  return otp;
}

/**
 * Verifies the provided OTP against the stored one in Redis.
 * Delegates security, consumption, and expiration/attempt checks to RedisService.
 */
export async function verifyOTP(
  userId: string,
  otp: string,
  purpose: OtpPurpose = "EMAIL_VERIFICATION"
): Promise<boolean> {
  const isValid = await RedisService.verifyOTP(
    userId,
    otp,
    purpose,
    OTP_MAX_ATTEMPTS,
    TTL.OTP_BLOCK 
  );

  return isValid;
}

/**
 * Deletes the OTP and related attempts counter immediately.
 */
export async function deleteOTP(
  userId: string,
  purpose: OtpPurpose = "EMAIL_VERIFICATION"
): Promise<void> {
  return RedisService.deleteOTP(userId, purpose);
}

/**
 * Return the latest OTP record (hashed) for a user & purpose.
 * Useful for testing/admin.
 */
export async function getLatestOTP(
  userId: string,
  purpose: OtpPurpose = "EMAIL_VERIFICATION"
): Promise<string | null> {
  return RedisService.getOTPHash(userId, purpose);
}