// ─── Venture Types ───────────────────────────────────────────────────────────

export interface Venture {
  id: string;
  cycleId: string;
  ventureName: string;
  allocatedAmountKobo: string;
  expectedProfitKobo: string;
  profitRealizedKobo: string;
  managedById: string;
  managedByName: string;
  createdAt: string;
  updatedAt: string;
}

export interface VentureSummary {
  cycleId: string;
  totalAllocatedKobo: string;
  totalExpectedProfitKobo: string;
  totalProfitRealizedKobo: string;
  ventureCount: number;
  ventures: Venture[];
}

// ─── Request/Response Types ──────────────────────────────────────────────────

export interface CreateVentureRequest {
  cycleId: string;
  ventureName: string;
  allocatedAmountNaira: number;
  expectedProfitNaira: number;
  managedById: string;
}

export interface UpdateVentureRequest {
  ventureName?: string;
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
