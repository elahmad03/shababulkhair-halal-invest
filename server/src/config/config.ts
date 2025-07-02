// server/src/config/config.ts
import dotenv from "dotenv";

// Load environment variables
dotenv.config();

// Critical check for JWT_SECRET
if (!process.env.JWT_SECRET) {
  throw new Error(
    "JWT_SECRET must be defined in .env or environment variables."
  );
}

// Explicitly type and export your environment variables
export const JWT_SECRET: string = process.env.JWT_SECRET;
export const JWT_EXPIRES_IN: string = process.env.JWT_EXPIRES_IN || "1h";
export const ENCRYPTION_SECRET: string =
  process.env.ENCRYPTION_SECRET || "fallback_encryption_secret_dev_only";
export const SIDRA_RPC_URL: string =
  process.env.SIDRA_RPC_URL || "http://localhost:8545";
export const TOKEN_CONTRACT: string =
  process.env.TOKEN_CONTRACT || "0xDefaultTokenContractAddress";

// Main configuration
const config = {
  app: {
    port: parseInt(process.env.PORT || "4000"),
    baseUrl: process.env.APP_BASE_URL || "http://localhost:4000",
    env:
      (process.env.NODE_ENV as "development" | "production" | "test") ||
      "development",
    jwtSecret: JWT_SECRET,
    jwtExpiresIn: JWT_EXPIRES_IN,
  },
  database: {
    url:
      process.env.DATABASE_URL ||
      "postgresql://user:password@localhost:5432/dbname",
  },
  monnify: {
    baseUrl: process.env.MONNIFY_BASE_URL || "https://sandbox.monnify.com",
    apiKey: process.env.MONNIFY_API_KEY || "",
    secretKey: process.env.MONNIFY_SECRET_KEY || "",
    contractCode: process.env.MONNIFY_CONTRACT_CODE || "",
  },
  paystack: {
    secretKey: process.env.PAYSTACK_SECRET_KEY!,
  },
  sidra: {
    rpcUrl: SIDRA_RPC_URL,
    tokenContract: TOKEN_CONTRACT,
  },
  encryption: {
    secret: ENCRYPTION_SECRET,
  },
};

export default config;
