// lib/data/cycles.ts
import { CycleDetails } from "@/lib/types/cycle"

export async function getCycleById(id: string): Promise<CycleDetails> {
  // TODO: Replace with actual API call
  // const response = await fetch(`/api/cycles/${id}`)
  // return response.json()
  
  return {
    id: id,
    name: "August 2025 Cycle",
    status: "Active",
    totalCapitalInvested: 500000,
    totalSharesSold: 1000,
    numberOfInvestors: 25,
    investors: [
      {
        id: "inv-1",
        memberName: "John Doe",
        shares: 50,
        amountInvested: 25000,
        sharePercentage: 5.0,
      },
      {
        id: "inv-2",
        memberName: "Jane Smith",
        shares: 100,
        amountInvested: 50000,
        sharePercentage: 10.0,
      },
      {
        id: "inv-3",
        memberName: "Michael Brown",
        shares: 75,
        amountInvested: 37500,
        sharePercentage: 7.5,
      },
    ],
    ventures: [
      {
        id: "ven-1",
        managedBy: "Sarah Johnson",
        ventureName: "Tech Startup Inc",
        allocatedAmount: 200000,
      },
      {
        id: "ven-2",
        managedBy: "Michael Chen",
        ventureName: "Real Estate Project",
        allocatedAmount: 300000,
      },
    ],
  }
}