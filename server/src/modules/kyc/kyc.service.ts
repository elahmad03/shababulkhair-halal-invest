import { KycDto } from "./kyc.schema";
import { KycMapper } from "./kyc.mapper";
import { AppError, NotFoundError } from "../../utils/errors";
import { KycStatus } from "@prisma/client";
import { prisma } from "../../config/prisma";
import cloudinary from "../../config/cloudinary";

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

    // Must be res.cloudinary.com
    if (parsed.hostname !== "res.cloudinary.com") return false;

    // Cloudinary path structure:
    // /{cloudName}/image/authenticated/s--TOKEN--/v{version}/kyc/{userId}/{type}/{filename}
    // OR without token:
    // /{cloudName}/image/authenticated/v{version}/kyc/{userId}/{type}/{filename}
    const segments = parsed.pathname.split("/").filter(Boolean);

    if (segments[0] !== cloudName)       return false;
    if (segments[1] !== "image")         return false;
    if (segments[2] !== "authenticated") return false;

    // Everything after /authenticated/ may contain s--TOKEN-- and v{version}
    // before the actual folder — so we just check the path contains the folder
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
    },
  });
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

    // ⚠️ Only include params in paramsToSign that you ALSO send in the upload
    // request. allowed_formats was here before but wasn't being sent to
    // Cloudinary in the upload, causing the signature mismatch.
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
      allowed_formats: ALLOWED_FORMATS, // sent to client for UI hints only, not signed
      type: "authenticated",
      cloud_name: cloudinary.config().cloud_name,
      api_key: cloudinary.config().api_key,
    };
  }

  /**
   * 🚀 Submit KYC — versioned + transactional.
   * Field names aligned with schema: idCardFrontUrl, idCardBackUrl, avatarUrl
   */
  static async submitKyc(userId: string, dto: KycDto) {
    // Validate URL ownership — aligned with schema field names
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
   * Requires adminId for audit logging — pass req.user.id from the controller.
   * Image URLs deliberately excluded from list view.
   */
  static async getPending(adminId: string) {
    await writeAuditLog("VIEW_PENDING", adminId);

    return prisma.kycProfile.findMany({
      where: { kycStatus: KycStatus.PENDING_REVIEW, isActive: true },
      select: {
        id: true,
        userId: true,
        version: true,
        kycStatus: true,
        createdAt: true,
        // idCardFrontUrl, idCardBackUrl, avatarUrl deliberately omitted
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
   * Uses schema-correct field names: idCardFrontUrl, idCardBackUrl, avatarUrl
   */
 static async getKycDetail(kycId: string, adminId: string) {
  // Include user so admin sees applicant name + email
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

  await writeAuditLog("VIEW_DETAIL", adminId, kycId);

  // cloudinary.url() expects a public_id NOT a full URL.
  // The stored URL looks like:
  //   https://res.cloudinary.com/{cloud}/image/authenticated/s--TOKEN--/v123456/kyc/userId/front/file.jpg
  // We extract everything after the version segment as the public_id.
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
    if (!publicId) return storedUrl; // fallback — don't break if parsing fails
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

    await writeAuditLog("APPROVE", adminId, kycId);

    return updated;
  }

  /**
   * ❌ Reject a KYC submission.
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

    await writeAuditLog("REJECT", adminId, kycId, { reason });

    return updated;
  }
}