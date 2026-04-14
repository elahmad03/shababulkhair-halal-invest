/**
 * @file idempotency.ts
 * @description Bank-grade idempotency engine.
 *
 * ─────────────────────────────────────────────────────────────────────────────
 * WHY THIS EXISTS
 * ─────────────────────────────────────────────────────────────────────────────
 * Mobile networks are unreliable. A user taps "Withdraw", the request reaches
 * the server, the wallet is debited — but the response never arrives due to
 * a dropped connection. The app retries. Without idempotency, the wallet is
 * debited TWICE for the same request.
 *
 * ─────────────────────────────────────────────────────────────────────────────
 * HOW IT WORKS
 * ─────────────────────────────────────────────────────────────────────────────
 * Client generates a UUID v4 before every financial request and sends it in
 * the `Idempotency-Key` header.
 *
 *   NEW KEY     → lock record created, operation proceeds normally
 *   COMPLETED   → cached response returned immediately, operation skipped
 *   IN-FLIGHT   → 409 returned, client retries after 1–3 seconds
 *   STALE LOCK  → lock older than 30s (crashed server), reset and retry
 *
 * The lock is created and completed inside the same Prisma $transaction as
 * the wallet operation. If the transaction rolls back for any reason, the
 * idempotency record rolls back with it — no orphaned locks.
 *
 * ─────────────────────────────────────────────────────────────────────────────
 * USAGE
 * ─────────────────────────────────────────────────────────────────────────────
 *   import { acquireIdempotencyLock, completeIdempotencyRecord } from '#lib/idempotency.js';
 *
 *   // Inside a prisma.$transaction(async (tx) => { ... }):
 *
 *   const { record, cached } = await acquireIdempotencyLock({
 *     key, userId, method: 'POST', path: '/api/v1/wallet/withdraw', tx,
 *   });
 *
 *   if (cached) return cached; // ← send this directly to the client
 *
 *   // ... do the actual operation ...
 *
 *   await completeIdempotencyRecord({ id: record.id, responseCode: 202, responseBody: result, tx });
 */

import type { Request } from 'express';
import { Prisma } from '@prisma/client';

import { ValidationError, WalletErrors } from '../utils/errors';
import {logger} from '../config/logger';

// ─────────────────────────────────────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────────────────────────────────────

/** Prisma transaction client — subset of PrismaClient bound to a transaction. */
type PrismaTransactionClient = Omit<
  Prisma.TransactionClient,
  '$connect' | '$disconnect' | '$on' | '$transaction' | '$use' | '$extends'
>;

/** Shape of an IdempotencyKey record returned by Prisma. */
interface IdempotencyKeyRecord {
  id: string;
  key: string;
  userId: string | null;
  requestMethod: string;
  requestPath: string;
  recoveryPoint: string;
  lockedAt: Date | null;
  responseCode: number | null;
  responseBody: unknown;
}

/** Return value of {@link acquireIdempotencyLock}. */
interface AcquireLockResult {
  /** The idempotency record (new or reset). */
  record: IdempotencyKeyRecord;
  /**
   * Non-null when a completed duplicate was detected.
   * Return this directly to the client — do not re-execute the operation.
   */
  cached: unknown | null;
}

/** Parameters for {@link acquireIdempotencyLock}. */
interface AcquireLockParams {
  /** UUID from the Idempotency-Key header. */
  key: string;
  /** Caller's user ID. */
  userId: string | null;
  /** HTTP method (e.g. `'POST'`). */
  method: string;
  /** Request path (e.g. `'/api/v1/wallet/withdraw'`). */
  path: string;
  /** Prisma transaction client. */
  tx: PrismaTransactionClient;
}

/** Parameters for {@link completeIdempotencyRecord}. */
interface CompleteRecordParams {
  /** `IdempotencyKey.id` of the record to seal. */
  id: string;
  /** HTTP status code to cache (e.g. `202`). */
  responseCode: number;
  /** The service result object to cache. */
  responseBody: Prisma.InputJsonValue;
  /** Prisma transaction client. */
  tx: PrismaTransactionClient;
}

// ─────────────────────────────────────────────────────────────────────────────
// Constants
// ─────────────────────────────────────────────────────────────────────────────

const UUID_REGEX =
  /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

const STALE_LOCK_TIMEOUT_MS = 30_000; // 30 seconds

// ─────────────────────────────────────────────────────────────────────────────
// extractIdempotencyKey
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Extract and validate the Idempotency-Key header from an Express request.
 * Call this at the TOP of any mutating financial controller.
 *
 * @param req - Express request object.
 * @returns The validated UUID key.
 * @throws {ValidationError} If the header is missing or not a valid UUID v4.
 */
export function extractIdempotencyKey(req: Request): string {
  const key = req.headers['idempotency-key'];

  if (!key) {
    throw new ValidationError(
      'The Idempotency-Key header is required for financial transactions. ' +
        'Generate a UUID v4 on the client before each request.',
    );
  }

  // Headers can technically be string | string[]; normalise to string.
  const keyStr = Array.isArray(key) ? key[0] : key;

  if (!UUID_REGEX.test(keyStr)) {
    throw new ValidationError(
      'Idempotency-Key must be a valid UUID v4 ' +
        '(e.g. 550e8400-e29b-41d4-a716-446655440000).',
    );
  }

  return keyStr;
}

// ─────────────────────────────────────────────────────────────────────────────
// acquireIdempotencyLock
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Attempt to acquire an idempotency lock for a financial operation.
 * **Must** be called inside a Prisma `$transaction`.
 *
 * @returns An object with the idempotency `record` and a `cached` response.
 *   When `cached` is non-null a duplicate was detected — return it directly to
 *   the client without re-executing the operation.
 */
export async function acquireIdempotencyLock({
  key,
  userId,
  method,
  path,
  tx,
}: AcquireLockParams): Promise<AcquireLockResult> {
  const existing = await tx.idempotencyKey.findUnique({ where: { key } });

  if (existing) {
    // ── Key used for a DIFFERENT endpoint — client programming error ─────────
    if (existing.requestMethod !== method || existing.requestPath !== path) {
      logger.warn('Idempotency key reused for different endpoint', {
        key,
        userId,
        originalMethod: existing.requestMethod,
        originalPath: existing.requestPath,
        incomingMethod: method,
        incomingPath: path,
      });
      throw WalletErrors.keyMismatch();
    }

    // ── COMPLETED — return the cached result, skip re-execution ─────────────
    if (existing.recoveryPoint === 'COMPLETED' && existing.responseCode !== null) {
      logger.info('Idempotency cache hit — returning stored response', {
        key,
        userId,
        responseCode: existing.responseCode,
      });
      return {
        record: existing,
        cached: existing.responseBody,
      };
    }

    // ── IN-FLIGHT — another request is currently processing this key ─────────
    const lockedAt = existing.lockedAt ? new Date(existing.lockedAt).getTime() : 0;
    const ageMs = Date.now() - lockedAt;

    if (ageMs < STALE_LOCK_TIMEOUT_MS) {
      logger.warn('Idempotency key in flight — rejecting concurrent duplicate', {
        key,
        userId,
        ageMs,
      });
      throw WalletErrors.requestInFlight();
    }

    // ── STALE LOCK — server crashed mid-operation, safe to retry ────────────
    logger.warn('Stale idempotency lock — resetting for retry', { key, userId, ageMs });

    const reset = await tx.idempotencyKey.update({
      where: { key },
      data: {
        recoveryPoint: 'STARTED',
        lockedAt: new Date(),
        responseCode: null,
        responseBody: Prisma.JsonNull,
      },
    });

    return { record: reset, cached: null };
  }

  // ── NEW KEY — create lock record and proceed ─────────────────────────────
  const record = await tx.idempotencyKey.create({
    data: {
      key,
      userId,
      requestMethod: method,
      requestPath: path,
      recoveryPoint: 'STARTED',
      lockedAt: new Date(),
    },
  });

  logger.debug('Idempotency lock acquired', { key, userId });

  return { record, cached: null };
}

// ─────────────────────────────────────────────────────────────────────────────
// completeIdempotencyRecord
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Seal the idempotency record as COMPLETED and store the response body.
 * **Must** be called at the END of the operation, inside the same `$transaction`.
 */
export async function completeIdempotencyRecord({
  id,
  responseCode,
  responseBody,
  tx,
}: CompleteRecordParams): Promise<void> {
  await tx.idempotencyKey.update({
    where: { id },
    data: {
      recoveryPoint: 'COMPLETED',
      responseCode,
      responseBody: responseBody as Prisma.InputJsonValue,
      lockedAt: null, // release the lock
    },
  });
}