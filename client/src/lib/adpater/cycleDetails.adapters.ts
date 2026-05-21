// src/lib/adpater/cycleDetails.adapters.ts
import { CycleDetails, mapStatus } from "@/lib/types/cycle";

export const mapCycleDetailsToUI = (data: any): CycleDetails => {
  // Map investors from the server response
  const investors = (data.investments || []).map((inv: any) => {
    const user = inv.user || {};
    const totalInvested = BigInt(inv.amountInvestedKobo || 0);
    const sharesAllocated = BigInt(inv.sharesAllocated || 0);
    const profitEarned = BigInt(inv.profitEarnedKobo || 0);
    
    // Calculate share percentage if we have total capital
    const totalCapital = BigInt(data.investments?.reduce((sum: bigint, i: any) => sum + BigInt(i.amountInvestedKobo || 0), 0n) || 1n);
    const sharePercentage = totalCapital > 0n ? Number((sharesAllocated * 100n) / totalCapital) : 0;
    
    return {
      id: inv.id,
      memberName: `${user.firstName || ''} ${user.lastName || ''}`.trim() || 'Unknown',
      shares: Number(sharesAllocated),
      amountInvested: totalInvested,
      sharePercentage,
      profitEarned,
      amountWithProfit: totalInvested + profitEarned,
    };
  });

  // Map ventures from the server response
  const ventures = (data.businessVentures || []).map((v: any) => ({
    id: v.id,
    managedBy: v.managedBy?.firstName + ' ' + v.managedBy?.lastName || 'Unknown',
    ventureName: v.ventureName,
    allocatedAmount: BigInt(v.allocatedAmountKobo || 0),
    profitRealized: BigInt(v.profitRealizedKobo || 0),
  }));

  // Calculate total capital invested
  const totalCapitalInvested = BigInt(
    data.investments?.reduce((sum: bigint, inv: any) => sum + BigInt(inv.amountInvestedKobo || 0), 0n) || 0n
  );

  return {
    id: data.id,
    name: data.cycleName, // Server field is cycleName
    status: mapStatus(data.status), // Server status is UPPERCASE: PENDING, OPEN_FOR_INVESTMENT, ACTIVE, COMPLETED
    
    // Core metrics
    totalCapitalInvested,
    totalSharesSold: data.investments?.reduce((sum: number, inv: any) => sum + Number(inv.sharesAllocated || 0), 0) || 0,
    numberOfInvestors: data.investments?.length || 0,
    ventureCount: (data.businessVentures?.length || 0),

    // Profit breakdown
    profitRealized: BigInt(data.totalProfitRealizedKobo || 0),
    investorPool: BigInt(data.investorProfitPoolKobo || 0),
    organizationalShare: BigInt(data.orgProfitShareKobo || 0),

    // Dates
    startDate: data.startDate,
    endDate: data.endDate,
    createdAt: data.createdAt,

    // Relations
    investors,
    ventures,
  };
}