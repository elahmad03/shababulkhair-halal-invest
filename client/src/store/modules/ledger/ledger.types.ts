// ─── Ledger/Transaction Types ────────────────────────────────────────────────

export type TransactionType =
  | "DEPOSIT"
  | "SHARE_PURCHASE"
  | "CAPITAL_RETURN"
  | "PROFIT_DISTRIBUTION"
  | "WITHDRAWAL"
  | "SERVICE_PAYMENT"
  | "EMERGENCY_WITHDRAWAL";

export type TransactionStatus = "PENDING" | "COMPLETED" | "FAILED";

export interface Transaction {
  id: string;
  userId: string;
  transactionType: TransactionType;
  amountKobo: string;
  transactionStatus: TransactionStatus;
  narration?: string;
  relatedEntityType?: string;
  relatedEntityId?: string;
  createdAt: string;
}

export interface TransactionDetail extends Transaction {
  user?: {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
  };
}

export interface MemberLedgerResponse {
  data: Transaction[];
  meta: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export interface MemberSummary {
  userId: string;
  walletBalanceKobo: string;
  lockedBalanceKobo: string;
  categoryTotals: {
    [key: string]: string;
  };
  lifetimeTotals: {
    deposited: string;
    invested: string;
    returned: string;
    profitDistributed: string;
    withdrawn: string;
  };
}

// ─── Organizational Ledger Types ─────────────────────────────────────────────

export type LedgerEntryType = "INCOME" | "EXPENSE";

export interface OrgLedgerEntry {
  id: string;
  entryType: LedgerEntryType;
  source: string;
  amountKobo: string;
  date: string;
  cycleId?: string;
  recordedById: string;
  recordedByName: string;
  createdAt: string;
}

export interface OrgLedgerResponse {
  data: OrgLedgerEntry[];
  meta: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

// ─── Request Types ───────────────────────────────────────────────────────────

export interface GetMemberLedgerFilters {
  type?: TransactionType;
  status?: TransactionStatus;
  startDate?: string;
  endDate?: string;
  page?: number;
  limit?: number;
}

export interface GetOrgLedgerFilters {
  cycleId?: string;
  entryType?: LedgerEntryType;
  startDate?: string;
  endDate?: string;
  page?: number;
  limit?: number;
}

export interface RecordOrgEntryRequest {
  entryType: LedgerEntryType;
  source: string;
  amountNaira: number;
  date: string;
  relatedCycleId?: string;
}
