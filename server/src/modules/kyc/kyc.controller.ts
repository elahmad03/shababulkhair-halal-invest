import { Response } from "express";
import { KycService } from "./kyc.service";
import { submitKycSchema } from "./kyc.schema";
import { catchAsync } from "../../utils/catchAsync";
import { AuthenticatedRequest } from "../../common/middleware/auth.middleware";
import { successResponse } from "../../utils/response";
import { BadRequestError } from "../../utils/errors";

export class KycController {
  /**
   * GET /kyc/signature?type=front|back|avatar
   * Returns a Cloudinary upload signature for direct client upload.
   */
  static getUploadSignature = catchAsync(async (req: AuthenticatedRequest, res: Response) => {
    const type = req.query.type as "front" | "back" | "avatar";

    if (!["front", "back", "avatar"].includes(type)) {
      throw new BadRequestError('type must be one of: front, back, avatar');
    }

    const data = KycService.getUploadSignature(req.user!.userId, type);
    res.json(successResponse(data));
  });

  /**
   * POST /kyc/submit
   * Submits a KYC application for the authenticated user.
   */
  static submit = catchAsync(async (req: AuthenticatedRequest, res: Response) => {
    const parsed = submitKycSchema.safeParse(req.body);
    if (!parsed.success) throw new BadRequestError("Invalid KYC data");

    const data = await KycService.submitKyc(req.user!.userId, parsed.data);
    res.json(successResponse(data, "KYC submitted"));
  });

  /**
   * GET /kyc/me
   * Returns the authenticated user's current active KYC record.
   */
  static me = catchAsync(async (req: AuthenticatedRequest, res: Response) => {
    const data = await KycService.getMyKyc(req.user!.userId);
    res.json(successResponse(data));
  });

  /**
   * GET /kyc/pending  [Admin]
   * Lists all pending KYC submissions — image URLs excluded from this view.
   * Fixed: passes req.user!.id as adminId for audit logging.
   */
  static pending = catchAsync(async (req: AuthenticatedRequest, res: Response) => {
    const data = await KycService.getPending(req.user!.userId);
    res.json(successResponse(data));
  });

  /**
   * GET /kyc/:kycId  [Admin]
   * Returns full KYC detail including short-lived signed image URLs.
   * Fixed: passes req.user!.id as adminId for audit logging.
   */
  static detail = catchAsync(async (req: AuthenticatedRequest, res: Response) => {
    const data = await KycService.getKycDetail(req.params.kycId, req.user!.userId);
    res.json(successResponse(data));
  });

  /**
   * PATCH /kyc/:kycId/approve  [Admin]
   */
  static approve = catchAsync(async (req: AuthenticatedRequest, res: Response) => {
    const data = await KycService.approve(req.params.kycId, req.user!.userId);
    res.json(successResponse(data, "Approved"));
  });

  /**
   * PATCH /kyc/:kycId/reject  [Admin]
   */
  static reject = catchAsync(async (req: AuthenticatedRequest, res: Response) => {
    const data = await KycService.reject(
      req.params.kycId,
      req.body.reason,
      req.user!.userId
    );
    res.json(successResponse(data, "Rejected"));
  });
}