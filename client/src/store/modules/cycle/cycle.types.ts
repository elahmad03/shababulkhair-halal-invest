
// ─── Types ───────────────────────────────────────────────────────────

// Cycle
export interface Cycle {
  id: string;
  cycleName: string;
  status: string;
  totalShares: number;
  PricePerShareKobo: string;
  createdAt: string;
  startDate: string | null;
  endDate: string | null;
}

// Pagination
export interface PaginatedCycles {
  data: Cycle[];
  page: number;
  limit: number;
  total: number;
}

// Member Position
export interface MemberPosition {
  cycleId: string;
  sharesOwned: number;
  totalInvestedKobo: string;
}

// Investment History
export interface InvestmentHistory {
  cycleId: string;
  sharesOwned: number;
  totalInvestedKobo: string;
  status: string;
}

// Purchase Shares
export interface PurchaseSharesRequest {
  shares: number;
  idempotencyKey: string;
}

export interface PurchaseSharesResponse {
  transactionId: string;
  sharesPurchased: number;
  totalCostKobo: string;
}

// Create Cycle
export interface CreateCycleRequest {
  cycleName: string;
  pricePerShareNaira: number;
  startDate?: string;
  endDate?: string;
  description?: string;
}
// Complete Cycle
export interface CompleteCycleRequest {
  investorProfitPercent: number;
}

// Venture
export interface CreateVentureRequest {
  name: string;
  description?: string;
}

export interface RecordVentureProfitRequest {
  profitAmount: number;
}

// Ledger
export interface LedgerEntryRequest {
  type: "INCOME" | "EXPENSE";
  amount: number;
  description?: string;
}
