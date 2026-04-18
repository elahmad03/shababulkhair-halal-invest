import { CycleDetails, mapStatus } from "../types/cycle";



export function mapCycleDetailsToUI(cycle: ApiCycleDetails): CycleDetails {
  return {
    id: cycle.id,
    name: cycle.cycleName,
    status: mapStatus(cycle.status),

    startDate: cycle.startDate,
    endDate: cycle.endDate,

    totalCapitalInvested: BigInt(0), // until backend adds
    numberOfInvestors: cycle._count?.investments ?? 0,
    ventureCount: cycle._count?.businessVentures ?? 0,

    profitRealized: BigInt(cycle.totalProfitRealizedKobo ?? 0),

    investors: cycle.investments ?? [],
    ventures: cycle.businessVentures ?? [],
  };
}