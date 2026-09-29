// ─── Cycle Status Enum ────────────────────────────────────────────────────────

export type CycleStatus =
  | "PENDING"
  | "OPEN_FOR_INVESTMENT"
  | "ACTIVE"
  | "CLOSING"
  | "COMPLETED";

// ─── Core Cycle Interface ─────────────────────────────────────────────────────

export interface Cycle {
  id: string;
  cycleName: string;
  status: CycleStatus | string;
  pricePerShareKobo: string;
  fundingOpensAt: string | null;
  fundingClosesAt: string | null;
  activeStartsAt: string | null;
  activeEndsAt: string | null;
  description?: string | null;
  totalProfitRealizedKobo?: string;
  investorProfitPoolKobo?: string;
  orgProfitShareKobo?: string;
  profitDistributionStatus?: "PENDING" | "COMPLETED" | string;
  createdAt: string;
  _count?: {
    investments: number;
    businessVentures: number;
  };
}

export type InvestmentCycle = Cycle;

// ─── Shareholder Investment ───────────────────────────────────────────────────

export interface ShareholderInvestment {
  id: string;
  userId: string;
  cycleId: string;
  sharesAllocated: number | string;
  amountInvestedKobo: string;
  profitEarnedKobo: string;
  createdAt: string;
  user?: {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
    phoneNumber?: string;
  };
  cycle?: {
    id: string;
    cycleName: string;
    status: CycleStatus | string;
    fundingOpensAt: string | null;
    fundingClosesAt: string | null;
    activeStartsAt: string | null;
    activeEndsAt: string | null;
    profitDistributionStatus?: string;
  };
}

// ─── Pagination Envelope ──────────────────────────────────────────────────────

export interface PaginatedCycles {
  cycles?: Cycle[];
  data?: Cycle[];
  page: number;
  limit: number;
  total: number;
  totalPages?: number;
}

// ─── Member Position / History ────────────────────────────────────────────────

export interface MemberPosition {
  investment: ShareholderInvestment | null;
  invested?: ShareholderInvestment | null;
  cycle: {
    id?: string;
    cycleName: string;
    status: CycleStatus | string;
    pricePerShareKobo: string;
  };
}

export interface InvestmentHistory extends ShareholderInvestment {}

// ─── Cycle Investments (Admin) ────────────────────────────────────────────────

export interface CycleInvestmentsResponse {
  investments: ShareholderInvestment[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
  totalInvestedKobo: string;
  totalSharesAllocated: string;
}

// ─── Request Shapes ───────────────────────────────────────────────────────────

export interface CreateCycleRequest {
  cycleName: string;
  pricePerShareNaira?: number;
  fundingOpensAt?: string;
  fundingClosesAt?: string;
  activeStartsAt?: string;
  activeEndsAt?: string;
  description?: string;
}

export interface UpdateCycleRequest {
  cycleName?: string;
  description?: string;
  fundingOpensAt?: string;
  fundingClosesAt?: string;
  activeStartsAt?: string;
  activeEndsAt?: string;
}

export interface UpdateCycleStatusRequest {
  status: CycleStatus;
}

export interface PurchaseSharesRequest {
  shares?: number;
  sharesRequested?: number;
  quantity?: number;
  idempotencyKey?: string;
}

export interface PurchaseSharesResponse {
  investment: ShareholderInvestment;
  investmentId: string;
  sharesAllocated: number | string;
  amountInvestedKobo: string;
  pricePerShareKobo: string;
  totalCostKobo: string;
}

export interface DistributeProfitRequest {
  investorProfitPercentage: number;
  notes?: string;
}

export interface DistributeProfitResponse {
  cycle: Cycle;
  distribution: {
    id: string;
    cycleId: string;
    authorisedById: string;
    investorProfitPercentage: number;
    orgProfitPercentage: number;
    totalProfitKobo: string;
    investorProfitPoolKobo: string;
    orgProfitShareKobo: string;
    notes?: string | null;
    createdAt: string;
  };
}

export interface CompleteCycleRequest {
  investorProfitPercent: number;
}