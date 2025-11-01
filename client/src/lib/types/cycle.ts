
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
  totalCapitalInvested: BigInt
  totalSharesSold: number
  numberOfInvestors: number
  profitRealized?: BigInt
  expectedProfit?: BigInt
  investorPool?: BigInt
  organizationalShare?: BigInt
  investors: Investor[]
  ventures: BusinessVenture[]
}