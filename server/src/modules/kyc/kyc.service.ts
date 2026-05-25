import { KycDto } from "./kyc.schema";
import { KycMapper } from "./kyc.mapper";
import { AppError, NotFoundError } from "../../utils/errors";
import { KycStatus } from "@prisma/client";
import { prisma } from "../../config/prisma";
import cloudinary from "../../config/cloudinary";
import { kycCleanupQueue, kycAuditQueue } from "../../jobs/queues/kyc.queue";

// ─── Constants ────────────────────────────────────────────────────────────────

const ALLOWED_FORMATS = ["jpg", "jpeg", "png", "pdf"] as const;
const SIGNATURE_RATE_LIMIT_WINDOW_MS = 60 * 60 * 1000; // 1 hour
const SIGNATURE_RATE_LIMIT_MAX = 15;

// In-memory rate limit store — replace with Redis in production
const signatureRateLimitMap = new Map<string, { count: number; windowStart: number }>();

// ─── Helpers ──────────────────────────────────────────────────────────────────

/**
 * Validates that a submitted KYC image URL:
 *  - Belongs to your Cloudinary account
 *  - Is under the correct user/type folder
 *  - Is an authenticated (private) asset
 */
function validateKycUrl(url: string, userId: string, type: "front" | "back" | "avatar"): boolean {
  const cloudName = cloudinary.config().cloud_name;

  try {
    const parsed = new URL(url);

    if (parsed.hostname !== "res.cloudinary.com") return false;

    const segments = parsed.pathname.split("/").filter(Boolean);

    if (segments[0] !== cloudName)       return false;
    if (segments[1] !== "image")         return false;
    if (segments[2] !== "authenticated") return false;

    const remainingPath = segments.slice(3).join("/");
    const expectedFolder = `kyc/${userId}/${type}/`;

    return remainingPath.includes(expectedFolder);
  } catch {
    return false;
  }
}

/**
 * Enforces an in-memory sliding-window rate limit per userId.
 * Replace the Map with a Redis INCR + EXPIRE call for multi-instance deployments.
 */
function enforceSignatureRateLimit(userId: string): void {
  const now = Date.now();
  const entry = signatureRateLimitMap.get(userId);

  if (!entry || now - entry.windowStart > SIGNATURE_RATE_LIMIT_WINDOW_MS) {
    signatureRateLimitMap.set(userId, { count: 1, windowStart: now });
    return;
  }

  if (entry.count >= SIGNATURE_RATE_LIMIT_MAX) {
    throw new AppError("Too many signature requests. Please try again later.", 429);
  }

  entry.count += 1;
}

/**
 * Enqueues an audit log write via BullMQ.
 * Non-blocking — failures are retried by the worker, never surface to the caller.
 */
async function enqueueAuditLog(
  action: "VIEW_PENDING" | "VIEW_DETAIL" | "APPROVE" | "REJECT",
  actorId: string,
  kycId?: string,
  meta?: Record<string, unknown>
): Promise<void> {
  await kycAuditQueue.add(
    action, // use action as job name for easy queue inspection
    { action, actorId, kycId, meta },
    {
      // Deduplicate rapid identical audit events within a 2-second window.
      // jobId pattern: audit:{action}:{actorId}:{kycId} — identical calls
      // within the deduplication window are silently dropped by BullMQ.
      jobId: `audit:${action}:${actorId}:${kycId ?? "none"}:${Math.floor(Date.now() / 2000)}`,
    }
  );
}

// ─── Service ──────────────────────────────────────────────────────────────────

export class KycService {
  /**
   * 🔐 Generate a Cloudinary upload signature for the client to upload directly.
   */
  static getUploadSignature(userId: string, type: "front" | "back" | "avatar") {
    enforceSignatureRateLimit(userId);

    const timestamp = Math.round(Date.now() / 1000);
    const folder = `kyc/${userId}/${type}`;

    const paramsToSign = {
      timestamp,
      folder,
      type: "authenticated",
    };

    const signature = cloudinary.utils.api_sign_request(
      paramsToSign,
      cloudinary.config().api_secret as string
    );

    return {
      signature,
      timestamp,
      folder,
      allowed_formats: ALLOWED_FORMATS, // UI hint only — not signed
      type: "authenticated",
      cloud_name: cloudinary.config().cloud_name,
      api_key: cloudinary.config().api_key,
    };
  }

  /**
   * 🚀 Submit KYC — versioned + transactional.
   *
   * Changes from original:
   * - Old asset cleanup is now enqueued via BullMQ AFTER the transaction
   *   commits, so a Cloudinary hiccup can never roll back or block KYC submission.
   * - The cleanup job carries the previousKycId for traceability.
   */
  static async submitKyc(userId: string, dto: KycDto) {
    const urlFields: Array<{ field: keyof KycDto; type: "front" | "back" | "avatar" }> = [
      { field: "idCardFrontUrl", type: "front" },
      { field: "idCardBackUrl", type: "back" },
      { field: "avatarUrl", type: "avatar" },
    ];

    for (const { field, type } of urlFields) {
      const url = dto[field] as string | undefined;
      if (url && !validateKycUrl(url, userId, type)) {
        throw new AppError(`Invalid image URL for field: ${field}`, 400);
      }
    }

    const result = await prisma.$transaction(
      async (tx) => {
        const existing = await tx.kycProfile.findFirst({
          where: { userId, isActive: true },
          orderBy: { version: "desc" },
        });

        if (existing?.kycStatus === KycStatus.VERIFIED) {
          throw new AppError("KYC already verified", 400);
        }

        if (existing) {
          await tx.kycProfile.update({
            where: { id: existing.id },
            data: { isActive: false },
          });
        }

        const kyc = await tx.kycProfile.create({
          data: {
            ...KycMapper.toPersistence(userId, dto),
            version: existing ? existing.version + 1 : 1,
            isActive: true,
          },
        });

        return { kyc, previousUserId: existing ? userId : null };
      },
      { timeout: 10000 }
    );

    // ✅ Transaction committed — now safely enqueue cleanup outside the tx.
    // If this add() call fails, no data is corrupted; the old Cloudinary
    // assets simply linger until the next submission triggers cleanup again.
    if (result.previousUserId) {
      await kycCleanupQueue.add(
        "destroy-old-assets",
        { userId: result.previousUserId },
        {
          // Deduplicate: if the user spam-submits, only one cleanup job runs.
          jobId: `kyc-cleanup:${userId}`,
        }
      );
    }

    return result.kyc;
  }

  /**
   * 👤 Get the current user's own active KYC record.
   */
  static async getMyKyc(userId: string) {
    const kyc = await prisma.kycProfile.findFirst({
      where: { userId, isActive: true },
    });

    if (!kyc) throw new NotFoundError("KYC not found");

    return kyc;
  }

  /**
   * 🧑‍⚖️ Admin: list all pending KYC submissions.
   * Audit log is enqueued — never blocks the response.
   */
  static async getPending(adminId: string) {
    // Fire-and-forget — intentionally not awaited so audit never delays response
    enqueueAuditLog("VIEW_PENDING", adminId).catch((err) =>
      console.error("[kyc-audit] Failed to enqueue VIEW_PENDING audit:", err)
    );

    return prisma.kycProfile.findMany({
      where: { kycStatus: KycStatus.PENDING_REVIEW, isActive: true },
      select: {
        id: true,
        userId: true,
        version: true,
        kycStatus: true,
        createdAt: true,
        user: {
          select: {
            id: true,
            email: true,
            firstName: true,
            lastName: true,
          },
        },
      },
    });
  }

  /**
   * 🔍 Admin: get full KYC detail with short-lived signed image URLs.
   * Audit log is enqueued — never blocks the response.
   */
  static async getKycDetail(kycId: string, adminId: string) {
    const kyc = await prisma.kycProfile.findUnique({
      where: { id: kycId },
      include: {
        user: {
          select: {
            id: true,
            email: true,
            firstName: true,
            lastName: true,
          },
        },
      },
    });

    if (!kyc || !kyc.isActive) throw new NotFoundError("KYC not found");

    // Fire-and-forget — intentionally not awaited
    enqueueAuditLog("VIEW_DETAIL", adminId, kycId).catch((err) =>
      console.error("[kyc-audit] Failed to enqueue VIEW_DETAIL audit:", err)
    );

    const extractPublicId = (url: string): string | null => {
      try {
        const segments = new URL(url).pathname.split("/").filter(Boolean);
        const vIdx = segments.findIndex((s) => /^v\d+$/.test(s));
        if (vIdx === -1) return null;
        return segments.slice(vIdx + 1).join("/");
      } catch {
        return null;
      }
    };

    const expiresAt = Math.round(Date.now() / 1000) + 60 * 15; // 15 min

    const signUrl = (storedUrl: string | null): string | null => {
      if (!storedUrl) return null;
      const publicId = extractPublicId(storedUrl);
      if (!publicId) return storedUrl;
      return cloudinary.url(publicId, {
        type: "authenticated",
        sign_url: true,
        expires_at: expiresAt,
        resource_type: "image",
      });
    };

    return {
      ...kyc,
      avatarUrl:      signUrl(kyc.avatarUrl),
      idCardFrontUrl: signUrl(kyc.idCardFrontUrl),
      idCardBackUrl:  signUrl(kyc.idCardBackUrl),
    };
  }

  /**
   * ✅ Approve a KYC submission.
   * Audit log is enqueued after the DB write succeeds.
   */
  static async approve(kycId: string, adminId: string) {
    const kyc = await prisma.kycProfile.findUnique({ where: { id: kycId } });
    if (!kyc || !kyc.isActive) throw new NotFoundError("KYC not found");

    if (kyc.kycStatus !== KycStatus.PENDING_REVIEW) {
      throw new AppError(`Cannot approve a KYC with status: ${kyc.kycStatus}`, 400);
    }

    const updated = await prisma.kycProfile.update({
      where: { id: kycId },
      data: {
        kycStatus: KycStatus.VERIFIED,
        approvedById: adminId,
        reviewedAt: new Date(),
      },
    });

    // Enqueue after successful DB write — no point auditing a failed approve
    await enqueueAuditLog("APPROVE", adminId, kycId);

    return updated;
  }

  /**
   * ❌ Reject a KYC submission.
   * Audit log is enqueued after the DB write succeeds.
   */
  static async reject(kycId: string, reason: string, adminId: string) {
    if (!reason?.trim()) throw new AppError("Rejection reason required", 400);

    const kyc = await prisma.kycProfile.findUnique({ where: { id: kycId } });
    if (!kyc || !kyc.isActive) throw new NotFoundError("KYC not found");

    if (kyc.kycStatus !== KycStatus.PENDING_REVIEW) {
      throw new AppError(`Cannot reject a KYC with status: ${kyc.kycStatus}`, 400);
    }

    const updated = await prisma.kycProfile.update({
      where: { id: kycId },
      data: {
        kycStatus: KycStatus.REJECTED,
        rejectedReason: reason,
        approvedById: adminId,
        reviewedAt: new Date(),
      },
    });

    await enqueueAuditLog("REJECT", adminId, kycId, { reason });

    return updated;
  }
}