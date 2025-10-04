// lib/types/cycle.ts
export type CycleStatus = "Active" | "Completed" | "Pending"

export interface Investor {
  id: string
  memberName: string
  shares: number
  amountInvested: number
  sharePercentage: number
  profitEarned?: number
  amountWithProfit?: number
}

export interface BusinessVenture {
  id: string
  managedBy: string
  ventureName: string
  allocatedAmount: number
  profitRealized?: number
}

export interface CycleDetails {
  id: string
  name: string
  status: CycleStatus
  totalCapitalInvested: number
  totalSharesSold: number
  numberOfInvestors: number
  profitRealized?: number
  investorPool?: number
  organizationalShare?: number
  investors: Investor[]
  ventures: BusinessVenture[]
}