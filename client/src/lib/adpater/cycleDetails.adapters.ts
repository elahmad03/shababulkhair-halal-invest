// src/lib/adpater/cycleDetails.adapters.ts
import { CycleDetails, mapStatus } from "@/lib/types/cycle";

/**
 * Safely converts stringified or numeric server values to BigInt Kobo without throwing
 * on missing, nullish, or fractional values (adhering to TC39 BigInt constraints).
 */
export function toKoboBigInt(val: unknown): bigint {
  if (val == null) return 0n;
  if (typeof val === "bigint") return val;
  if (typeof val === "number") {
    return BigInt(Math.trunc(val));
  }
  if (typeof val === "string") {
    const trimmed = val.trim();
    if (!trimmed) return 0n;
    // Strip any fractional part to prevent SyntaxError: Cannot convert fractional string to a BigInt
    const intPart = trimmed.split(".")[0];
    try {
      return BigInt(intPart);
    } catch {
      return 0n;
    }
  }
  return 0n;
}

export const mapCycleDetailsToUI = (data: any): CycleDetails => {
  if (!data) {
    return {
      id: "",
      name: "",
      status: "pending",
      totalCapitalInvested: 0n,
      totalSharesSold: 0,
      numberOfInvestors: 0,
      ventureCount: 0,
      profitRealized: 0n,
      investorPool: 0n,
      organizationalShare: 0n,
      startDate: null,
      endDate: null,
      createdAt: "",
      investors: [],
      ventures: [],
    };
  }

  // Calculate total capital invested across all investments
  const totalCapitalInvested = BigInt(
    data.investments?.reduce(
      (sum: bigint, inv: any) => sum + toKoboBigInt(inv.amountInvestedKobo),
      0n
    ) || 0n
  );

  // Map investors preserving integer Kobo amounts
  const investors = (data.investments || []).map((inv: any) => {
    const user = inv.user || {};
    const totalInvested = toKoboBigInt(inv.amountInvestedKobo);
    const sharesAllocated = toKoboBigInt(inv.sharesAllocated);
    const profitEarned = toKoboBigInt(inv.profitEarnedKobo);

    // Calculate share percentage against total capital in basis points, then convert to percentage
    const sharePercentage =
      totalCapitalInvested > 0n
        ? Number((totalInvested * 10000n) / totalCapitalInvested) / 100
        : 0;

    return {
      id: inv.id,
      memberName: `${user.firstName || ""} ${user.lastName || ""}`.trim() || "Unknown",
      shares: Number(sharesAllocated),
      amountInvested: totalInvested, // Preserved integer Kobo BigInt
      sharePercentage,
      profitEarned, // Preserved integer Kobo BigInt
      amountWithProfit: totalInvested + profitEarned,
    };
  });

  // Map ventures preserving integer Kobo amounts
  const ventures = (data.businessVentures || []).map((v: any) => ({
    id: v.id,
    managedBy: v.managedBy
      ? `${v.managedBy.firstName || ""} ${v.managedBy.lastName || ""}`.trim()
      : "Unknown",
    ventureName: v.companyName || v.ventureName || "Unnamed Venture",
    allocatedAmount: toKoboBigInt(v.allocatedAmountKobo),
    profitRealized: toKoboBigInt(v.profitRealizedKobo),
    agreementReceiptUrl: v.agreementReceiptUrl || null,
  }));

  return {
    id: data.id,
    name: data.cycleName,
    status: mapStatus(data.status),
    rawStatus: data.status,
    profitDistributionStatus: data.profitDistributionStatus,

    // Core metrics (All monetary metrics preserved in integer Kobo)
    totalCapitalInvested,
    totalSharesSold:
      data.investments?.reduce(
        (sum: number, inv: any) => sum + Number(inv.sharesAllocated || 0),
        0
      ) || 0,
    numberOfInvestors: data.investments?.length || 0,
    ventureCount: data.businessVentures?.length || 0,

    // Profit breakdown in integer Kobo BigInt
    profitRealized: toKoboBigInt(data.totalProfitRealizedKobo),
    investorPool: toKoboBigInt(data.investorProfitPoolKobo),
    organizationalShare: toKoboBigInt(data.orgProfitShareKobo),

    // Dates
    startDate: data.activeStartsAt || data.startDate || null,
    endDate: data.activeEndsAt || data.endDate || null,
    createdAt: data.createdAt,

    // Relations
    investors,
    ventures,
  };
};
