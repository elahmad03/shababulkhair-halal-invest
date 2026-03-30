import { KycDto } from "./kyc.schema";
import { KycMapper } from "./kyc.mapper";
import { AppError, NotFoundError } from "../../utils/errors";
import { KycStatus } from "@prisma/client";
import { prisma } from "../../config/prisma";
import cloudinary from "../../config/cloudinary";

// ─── Constants ────────────────────────────────────────────────────────────────

const ALLOWED_FORMATS = ["jpg", "jpeg", "png", "pdf"] as const;
const SIGNATURE_RATE_LIMIT_WINDOW_MS = 60 * 60 * 1000; // 1 hour
const SIGNATURE_RATE_LIMIT_MAX = 5;

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
  const expected = `https://res.cloudinary.com/${cloudName}/image/authenticated/kyc/${userId}/${type}/`;
  return url.startsWith(expected);
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
 * Destroys all KYC assets for a user on Cloudinary (authenticated type).
 * Called when a user re-submits KYC so old ID images don't linger.
 */
async function destroyOldKycAssets(userId: string): Promise<void> {
  const types: Array<"front" | "back" | "avatar"> = ["front", "back", "avatar"];

  await Promise.allSettled(
    types.map((type) =>
      cloudinary.uploader.destroy(`kyc/${userId}/${type}`, {
        type: "authenticated",
        invalidate: true,
      })
    )
  );
}

/**
 * Writes an audit log entry to the KycAuditLog table.
 * Ensures every admin action (view, approve, reject) is traceable.
 */
async function writeAuditLog(
  action: "VIEW_PENDING" | "VIEW_DETAIL" | "APPROVE" | "REJECT",
  actorId: string,
  kycId?: string,
  meta?: Record<string, unknown>
): Promise<void> {
  await prisma.kycAuditLog.create({
    data: {
      action,
      actorId,
      kycId: kycId ?? null,
      meta: meta ? JSON.stringify(meta) : null,
      createdAt: new Date(),
    },
  });
}

// ─── Service ──────────────────────────────────────────────────────────────────

export class KycService {
  /**
   * 🔐 Generate a Cloudinary upload signature for the client to upload directly.
   *
   * Fixes applied:
   *  - Rate limited per userId (max 5/hr)
   *  - Restricts upload to allowed image/pdf formats only
   *  - Forces `type: authenticated` so uploaded assets are private
   */
  static getUploadSignature(userId: string, type: "front" | "back" | "avatar") {
    // Fix #7 — rate limit signature generation
    enforceSignatureRateLimit(userId);

    const timestamp = Math.round(Date.now() / 1000);
    const folder = `kyc/${userId}/${type}`;

    const paramsToSign = {
      timestamp,
      folder,
      // Fix #3 — restrict to safe file formats
      allowed_formats: ALLOWED_FORMATS.join(","),
      // Fix #1 — force private/authenticated delivery
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
      allowed_formats: ALLOWED_FORMATS,
      type: "authenticated",
      cloud_name: cloudinary.config().cloud_name,
      api_key: cloudinary.config().api_key,
    };
  }

  /**
   * 🚀 Submit KYC — versioned + transactional.
   *
   * Fixes applied:
   *  - Fix #2: Validates all submitted image URLs belong to this user's Cloudinary folder
   *  - Fix #4: Destroys old Cloudinary assets when user re-submits
   */
  static async submitKyc(userId: string, dto: KycDto) {
    // Fix #2 — validate URL ownership before persisting anything
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

    return prisma.$transaction(async (tx) => {
      const existing = await tx.kycProfile.findFirst({
        where: { userId, isActive: true },
        orderBy: { version: "desc" },
      });

      if (existing?.kycStatus === KycStatus.VERIFIED) {
        throw new AppError("KYC already verified", 400);
      }

      if (existing) {
        // Fix #4 — delete old ID card assets from Cloudinary before deactivating
        await destroyOldKycAssets(userId);

        await tx.kycProfile.update({
          where: { id: existing.id },
          data: { isActive: false },
        });
      }

      const newKyc = await tx.kycProfile.create({
        data: {
          ...KycMapper.toPersistence(userId, dto),
          version: existing ? existing.version + 1 : 1,
          isActive: true,
        },
      });

      return newKyc;
    });
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
   *
   * Fixes applied:
   *  - Fix #6: Audit log written on every admin list access
   *  - Fix #6: Image URLs are NOT returned in list view — admins must open the detail view
   */
  static async getPending(adminId: string) {
    // Fix #6 — audit every admin access
    await writeAuditLog("VIEW_PENDING", adminId);

    return prisma.kycProfile.findMany({
      where: { kycStatus: KycStatus.PENDING_REVIEW, isActive: true },
      select: {
        id: true,
        userId: true,
        version: true,
        kycStatus: true,
        createdAt: true,
        // Fix #6 — deliberately exclude image URLs from list view
        // frontImageUrl: false  ← omitted intentionally
        // backImageUrl: false   ← omitted intentionally
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
   * 🔍 Admin: get full KYC detail including signed (short-lived) image URLs.
   *
   * Fixes applied:
   *  - Fix #1: Image URLs re-generated as signed, expiring Cloudinary URLs
   *  - Fix #6: Audit log written on every detail view
   */
  static async getKycDetail(kycId: string, adminId: string) {
    const kyc = await prisma.kycProfile.findUnique({
      where: { id: kycId },
    });

    if (!kyc || !kyc.isActive) throw new NotFoundError("KYC not found");

    // Fix #6 — audit the detail view
    await writeAuditLog("VIEW_DETAIL", adminId, kycId);

    // Fix #1 — generate short-lived signed URLs instead of returning raw stored URLs
    const signedUrls = {
      frontImageUrl: kyc.idCardFrontUrl
        ? cloudinary.url(kyc.idCardFrontUrl, {
            type: "authenticated",
            sign_url: true,
            expires_at: Math.round(Date.now() / 1000) + 60 * 15, // 15 min expiry
          })
        : null,
      backImageUrl: kyc.idCardBackUrl
        ? cloudinary.url(kyc.idCardBackUrl, {
            type: "authenticated",
            sign_url: true,
            expires_at: Math.round(Date.now() / 1000) + 60 * 15,
          })
        : null,
      avatarUrl: kyc.avatarUrl
        ? cloudinary.url(kyc.avatarUrl, {
            type: "authenticated",
            sign_url: true,
            expires_at: Math.round(Date.now() / 1000) + 60 * 15,
          })
        : null,
    };

    return { ...kyc, ...signedUrls };
  }

  /**
   * ✅ Approve a KYC submission.
   *
   * Fixes applied:
   *  - Fix #5: Guards against approving an inactive/stale record
   *  - Fix #5: Guards against approving a non-pending record
   *  - Fix #6: Audit log written on approval
   */
  static async approve(kycId: string, adminId: string) {
    // Fix #5 — check isActive to prevent acting on stale versions
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

    // Fix #6 — audit the approval
    await writeAuditLog("APPROVE", adminId, kycId);

    return updated;
  }

  /**
   * ❌ Reject a KYC submission.
   *
   * Fixes applied:
   *  - Fix #5: Guards against rejecting an inactive/stale record
   *  - Fix #5: Guards against rejecting a non-pending record
   *  - Fix #6: Audit log written on rejection with reason
   */
  static async reject(kycId: string, reason: string, adminId: string) {
    if (!reason?.trim()) throw new AppError("Rejection reason required", 400);

    // Fix #5 — check isActive to prevent acting on stale versions
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

    // Fix #6 — audit the rejection with reason
    await writeAuditLog("REJECT", adminId, kycId, { reason });

    return updated;
  }
}