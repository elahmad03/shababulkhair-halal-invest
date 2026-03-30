import argon2 from "argon2";
import { env } from "../config";

/**
 * Argon2id parameters (tunable via environment).
 * Defaults are defined in src/config/index.ts.
 */
const ARGON2_OPTIONS = {
  type: argon2.argon2id,
  memoryCost: env.ARGON2_MEMORY_COST,
  timeCost: env.ARGON2_TIME_COST,
  parallelism: env.ARGON2_PARALLELISM,
};

export async function hashSecret(plain: string) {
  return await argon2.hash(plain, ARGON2_OPTIONS);
}

export async function verifySecret(hash: string, plain: string) {
  return await argon2.verify(hash, plain);
}

/**
 * Optional helper to check if a hash should be rehashed when parameters change.
 * Call this after verify to decide whether to re-hash and update DB for better future security.
 */
export async function needsRehash(hash: string) {
  return argon2.needsRehash(hash, ARGON2_OPTIONS);
}