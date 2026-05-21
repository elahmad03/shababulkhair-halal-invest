// ─── Venture Types ───────────────────────────────────────────────────────────

export type VentureStatus = "FUNDED" | "OPERATING" | "LIQUIDATED"

export interface ManagedByUser {
  id: string
  firstName: string
  lastName: string
  email: string
}

export interface CycleRef {
  id: string
  cycleName: string
  status: string
}

export interface Venture {
  id: string
  cycleId: string
  companyName: string
  allocatedAmountKobo: string
  expectedProfitKobo: string
  profitRealizedKobo: string
  managedById: string
  managedBy: ManagedByUser
  cycle: CycleRef
  status: VentureStatus
  createdAt?: string
  updatedAt?: string
}

export interface VentureSummary {
  cycleId: string
  totalAllocatedKobo: string
  totalExpectedProfitKobo: string
  totalProfitRealizedKobo: string
  ventureCount: number
  ventures: Venture[]
}

// ─── Request/Response Types ──────────────────────────────────────────────────

export interface CreateVentureRequest {
  cycleId: string
  companyName: string
  allocatedAmountNaira: number
  expectedProfitNaira: number
  managedById: string
}

export interface UpdateVentureRequest {
  companyName?: string
  expectedProfitNaira?: number
  managedById?: string
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
