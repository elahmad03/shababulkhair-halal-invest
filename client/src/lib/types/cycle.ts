
export type CycleStatus =
  | "pending"
  | "open_for_investment"
  | "active"
  | "completed";

export function mapStatus(status: string): CycleStatus {
  switch (status) {
    case "PENDING":
      return "pending";
    case "OPEN_FOR_INVESTMENT":
      return "open_for_investment";
    case "ACTIVE":
      return "active";
    case "COMPLETED":
      return "completed";
    default:
      throw new Error(`Unknown cycle status: ${status}`);
  }
}  

export interface Investor {
  id: string
  memberName: string
  shares: number
  amountInvested: bigint
  sharePercentage: number
  profitEarned?: bigint
  amountWithProfit?: bigint
}

export interface BusinessVenture {
  id: string
  managedBy: string
  ventureName: string
  allocatedAmount: bigint
  profitRealized?: bigint
}

export interface CycleDetails {
  id: string;
  name: string;
  status: CycleStatus;

  // ─── Core Metrics ─────────────────────
  totalCapitalInvested: bigint;
  totalSharesSold: number;
  numberOfInvestors: number;
  ventureCount: number;

  // ─── Profit Breakdown (never optional) ─
  profitRealized: bigint;
  investorPool: bigint;
  organizationalShare: bigint;

  // ─── Dates ────────────────────────────
  startDate: string | null;
  endDate: string | null;
  createdAt: string;

  // ─── Relations ────────────────────────
  investors: Investor[];
  ventures: BusinessVenture[];
}