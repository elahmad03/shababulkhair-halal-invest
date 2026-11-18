// ─── Venture Types ───────────────────────────────────────────────────────────

export type VentureStatus = "FUNDED" | "OPERATING" | "LIQUIDATED";

export interface ManagedByUser {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
}

export interface CycleRef {
  id: string;
  cycleName: string;
  status: string;
}

export interface AgreementUploadedBy {
  id: string;
  firstName: string;
  lastName: string;
}

export interface Venture {
  id: string;
  cycleId: string;
  companyName: string;
  allocatedAmountKobo: string;
  expectedProfitKobo: string;
  profitRealizedKobo: string;
  managedById: string;
  managedBy: ManagedByUser;
  cycle: CycleRef;
  status: VentureStatus;
  agreementReceiptUrl?: string | null;
  agreementUploadedById?: string | null;
  agreementUploadedAt?: string | null;
  agreementUploadedBy?: AgreementUploadedBy | null;
  createdAt?: string;
  updatedAt?: string;
}

export interface VentureSummary {
  cycleId: string;
  totalAllocatedKobo: string;
  totalExpectedProfitKobo: string;
  totalProfitRealizedKobo: string;
  ventureCount: number;
  ventures: Venture[];
}

export interface VentureListResponse {
  data: Venture[];
  summary: {
    count: number;
    totalAllocatedKobo: string;
    totalExpectedKobo: string;
    totalRealizedKobo: string;
  };
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

// ─── Venture Profit Entry Types (Committee / Admin) ──────────────────────────

export interface VentureProfitEntry {
  id: string;
  ventureId: string;
  recordedById: string;
  amountKobo: string;
  note?: string | null;
  createdAt: string;
  updatedAt: string;
  recordedBy?: {
    id: string;
    firstName: string;
    lastName: string;
    role?: string;
  };
}

export interface CreateProfitEntryRequest {
  ventureId: string;
  amountNaira?: number;
  amountKobo?: number | string;
  note?: string;
}

export interface CreateProfitEntryResponse {
  entry: VentureProfitEntry;
  ventureProfitRealizedKobo: string;
  cycleTotalProfitRealizedKobo: string;
}

export interface UpdateProfitEntryRequest {
  entryId: string;
  amountNaira?: number;
  amountKobo?: number | string;
  note?: string;
}

// ─── Agreement Receipt Types ────────────────────────────────────────────────

export interface UploadReceiptRequest {
  ventureId: string;
  agreementReceiptUrl: string;
}

export interface AgreementReceiptResponse {
  id: string;
  companyName: string;
  agreementReceiptUrl: string | null;
  agreementUploadedAt: string | null;
  agreementUploadedById: string | null;
  agreementUploadedBy?: AgreementUploadedBy | null;
}

// ─── Venture Investors Types ────────────────────────────────────────────────

export interface VentureInvestorRecord {
  id: string;
  userId: string;
  cycleId: string;
  sharesAllocated: number;
  amountInvestedKobo: string;
  createdAt: string;
  user: {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
    phoneNumber?: string | null;
  };
}

export interface VentureInvestorsResponse {
  ventureId: string;
  cycleId: string;
  investors: VentureInvestorRecord[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
  totalInvestedKobo: string;
  totalSharesAllocated: string;
}

// ─── Request/Response Types ──────────────────────────────────────────────────

export interface CreateVentureRequest {
  cycleId: string;
  companyName: string;
  allocatedAmountNaira: number;
  expectedProfitNaira: number;
  managedById: string;
}

export interface UpdateVentureRequest {
  companyName?: string;
  expectedProfitNaira?: number;
  managedById?: string;
}

export interface RecordVentureProfitRequest {
  profitRealizedNaira: number;
}

export interface RecordVentureProfitResponse {
  ventureId: string;
  profitRealizedKobo: string;
  previousProfitKobo: string;
  message: string;
}

export interface DeleteVentureResponse {
  ventureId: string;
  message: string;
}
