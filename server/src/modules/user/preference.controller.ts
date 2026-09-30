import { Response } from "express";
import { catchAsync } from "../../utils/catchAsync";
import { successResponse } from "../../utils/response";
import { AuthenticatedRequest } from "../../common/middleware/auth.middleware";
import PreferenceService from "./preference.service";
import { updatePreferenceSchema } from "./preference.validation";

// GET /api/users/me/preferences
export const getMyPreferences = catchAsync(
  async (req: AuthenticatedRequest, res: Response) => {
    const userId = req.user!.userId;
    const prefs = await PreferenceService.getPreferences(userId);
    res.status(200).json(successResponse(prefs, "Preferences retrieved"));
  }
);

// PUT /api/users/me/preferences
export const updateMyPreferences = catchAsync(
  async (req: AuthenticatedRequest, res: Response) => {
    const userId = req.user!.userId;
    const { autoReinvest } = updatePreferenceSchema.parse(req.body);
    const prefs = await PreferenceService.updatePreferences(userId, autoReinvest);
    res.status(200).json(
      successResponse(
        prefs,
        autoReinvest
          ? "Auto-invest enabled — your wallet balance will be automatically invested in the next open cycle"
          : "Auto-invest disabled — your funds will remain in your wallet after each cycle"
      )
    );
  }
);

