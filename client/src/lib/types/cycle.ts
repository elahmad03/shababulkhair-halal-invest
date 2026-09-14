export type CycleStatus =
  | "pending"
  | "open_for_investment"
  | "active"
  | "closing"
  | "completed";

export function mapStatus(status?: string | null): CycleStatus {
  if (!status) return "pending";
  const normalized = status.toUpperCase().trim();
  switch (normalized) {
    case "PENDING":
      return "pending";
    case "OPEN_FOR_INVESTMENT":
      return "open_for_investment";
    case "ACTIVE":
      return "active";
    case "CLOSING":
      return "closing";
    case "COMPLETED":
      return "completed";
    default:
      return "pending";
  }
}

export interface Investor {
  id: string;
  memberName: string;
  shares: number;
  amountInvested: bigint;
  sharePercentage: number;
  profitEarned?: bigint;
  amountWithProfit?: bigint;
}

export interface BusinessVenture {
  id: string;
  managedBy: string;
  ventureName: string;
  allocatedAmount: bigint;
  profitRealized?: bigint;
}

export interface CycleDetails {
  id: string;
  name: string;
  status: CycleStatus;
  rawStatus?: string;
  profitDistributionStatus?: string;

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