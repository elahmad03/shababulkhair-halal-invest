export interface BusinessAllocation {
  id: string
  ventureName: string
  managedBy: string
  managedById: string
  investmentCycle: string
  allocatedAmount: number
  profitRealized: number | null
  status: "Active" | "Completed"
  createdAt: Date
  completedAt?: Date
}

export interface InvestmentCycle {
  id: string
  name: string
  startDate: Date
  endDate: Date
}

export interface CommitteeMember {
  id: string
  name: string
  role: string
}

export const investmentCycles: InvestmentCycle[] = [
  {
    id: "1",
    name: "October 2025 Cycle",
    startDate: new Date("2025-10-01"),
    endDate: new Date("2025-10-31"),
  },
  {
    id: "2",
    name: "September 2025 Cycle",
    startDate: new Date("2025-09-01"),
    endDate: new Date("2025-09-30"),
  },
  {
    id: "3",
    name: "August 2025 Cycle",
    startDate: new Date("2025-08-01"),
    endDate: new Date("2025-08-31"),
  },
]

export const committeeMembers: CommitteeMember[] = [
  { id: "1", name: "Adebayo Johnson", role: "Committee" },
  { id: "2", name: "Chidinma Okafor", role: "Committee" },
  { id: "3", name: "Ibrahim Musa", role: "Committee" },
  { id: "4", name: "Folake Adeleke", role: "Committee" },
  { id: "5", name: "Emeka Nwosu", role: "Committee" },
]

export const businessAllocations: BusinessAllocation[] = [
  {
    id: "1",
    ventureName: "Phone Accessories Import",
    managedBy: "Adebayo Johnson",
    managedById: "1",
    investmentCycle: "October 2025 Cycle",
    allocatedAmount: 500000,
    profitRealized: 150000,
    status: "Completed",
    createdAt: new Date("2025-10-01"),
    completedAt: new Date("2025-10-25"),
  },
  {
    id: "2",
    ventureName: "Fabric Trading Business",
    managedBy: "Chidinma Okafor",
    managedById: "2",
    investmentCycle: "October 2025 Cycle",
    allocatedAmount: 750000,
    profitRealized: null,
    status: "Active",
    createdAt: new Date("2025-10-05"),
  },
  {
    id: "3",
    ventureName: "Agricultural Produce Supply",
    managedBy: "Ibrahim Musa",
    managedById: "3",
    investmentCycle: "September 2025 Cycle",
    allocatedAmount: 1000000,
    profitRealized: 300000,
    status: "Completed",
    createdAt: new Date("2025-09-01"),
    completedAt: new Date("2025-09-28"),
  },
  {
    id: "4",
    ventureName: "Event Equipment Rental",
    managedBy: "Folake Adeleke",
    managedById: "4",
    investmentCycle: "October 2025 Cycle",
    allocatedAmount: 600000,
    profitRealized: null,
    status: "Active",
    createdAt: new Date("2025-10-03"),
  },
  {
    id: "5",
    ventureName: "Computer Parts Resale",
    managedBy: "Emeka Nwosu",
    managedById: "5",
    investmentCycle: "September 2025 Cycle",
    allocatedAmount: 450000,
    profitRealized: 120000,
    status: "Completed",
    createdAt: new Date("2025-09-10"),
    completedAt: new Date("2025-09-29"),
  },
  {
    id: "6",
    ventureName: "Beauty Products Distribution",
    managedBy: "Chidinma Okafor",
    managedById: "2",
    investmentCycle: "August 2025 Cycle",
    allocatedAmount: 800000,
    profitRealized: 250000,
    status: "Completed",
    createdAt: new Date("2025-08-05"),
    completedAt: new Date("2025-08-30"),
  },
]
