
import dotenv from "dotenv";
import path from "path";
import { cleanEnv, str, port, num, bool } from "envalid";

// Detect environment (default to development if unset)
const nodeEnv = process.env.NODE_ENV ?? "development";

// Dynamically pick the env file
const envFile = `.env.${nodeEnv}`;
const envPath = path.resolve(process.cwd(), envFile);

// Load the env file if it exists
const result = dotenv.config({ path: envPath });

if (result.parsed) {
  console.info(`✅ Loaded environment from: ${envFile}`);
} else {
  console.warn(`⚠️ No ${envFile} found. Falling back to process.env`);
}

// Validate and export all required environment variables
export const env = cleanEnv(process.env, {
  NODE_ENV: str({ choices: ["development", "test", "production"] }),

  // Server configuration
  PORT: port({ default: 5000 }),

  // Database connection string
  DATABASE_URL: str(),

  REDIS_HOST: str(),
  REDIS_PORT: port(),
  REDIS_PASSWORD: str(),

  // JWT configuration
  JWT_ACCESS_TOKEN_SECRET: str(),
  JWT_ACCESS_TOKEN_EXPIRES_IN: str(),
  JWT_REFRESH_TOKEN_SECRET: str(),
  JWT_REFRESH_TOKEN_EXPIRES_IN: str(),

  // Argon2 password hashing configuration
  ARGON2_MEMORY_COST: num({ default: 65536 }),
  ARGON2_TIME_COST: num({ default: 3 }),
  ARGON2_PARALLELISM: num({ default: 2 }),

  // Rate limiting configuration
  RATE_LIMIT_ENABLED: bool({ default: true }),
  RATE_LIMIT_WINDOW_MINUTES: num({ default: 15 }),
  RATE_LIMIT_MAX: num({ default: 100 }),

  // OTP expiration in minutes
  OTP_EXPIRES_MINUTES: num({ default: 5 }),

  // Frontend client origin
  CLIENT_ORIGIN: str(),

   SMTP_HOST: str(),
  SMTP_PORT: num(),
  SMTP_USER: str(),
  SMTP_PASS: str(),

  // cloudinary
CLOUDINARY_CLOUD_NAME: str(),
CLOUDINARY_API_KEY: str(),
CLOUDINARY_API_SECRET: str(),
// PAYSTACK
PAYSTACK_PUBLIC_KEY: str(),
PAYSTACK_SECRET_KEY: str(),

});