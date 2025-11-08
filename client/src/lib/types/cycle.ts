
export type CycleStatus = "Active" | "Completed" | "Pending"

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
  id: string
  name: string
  status: CycleStatus
  totalCapitalInvested: bigint
  totalSharesSold: number
  numberOfInvestors: number
  profitRealized?: bigint
  expectedProfit?: bigint
  investorPool?: bigint
  organizationalShare?: bigint
  investors: Investor[]
  ventures: BusinessVenture[]
}