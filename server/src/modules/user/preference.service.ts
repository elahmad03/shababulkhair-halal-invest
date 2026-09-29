/**
 * preference.service.ts
 *
 * Manages UserPreference — currently: autoReinvest flag.
 * Uses upsert so the record is created on first access without
 * requiring a separate "init" step.
 */

import { prisma } from "../../config/prisma";

export default class PreferenceService {
  /**
   * Get the user's preference record.
   * Returns sensible defaults if no record exists yet.
   */
  static async getPreferences(userId: string) {
    const pref = await prisma.userPreference.findUnique({
      where: { userId },
      select: { autoReinvest: true },
    });

    // Return defaults when record doesn't exist yet
    return pref ?? { autoReinvest: false };
  }

  /**
   * Upsert the user's preference record.
   * Safe to call multiple times — idempotent.
   */
  static async updatePreferences(userId: string, autoReinvest: boolean) {
    const pref = await prisma.userPreference.upsert({
      where: { userId },
      create: { userId, autoReinvest },
      update: { autoReinvest },
      select: { autoReinvest: true },
    });

    return pref;
  }
}

