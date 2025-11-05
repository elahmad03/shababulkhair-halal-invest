import HeaderBox from "@/components/common/HeaderBox"
import BusinessStatsCards from "@/components/admin/business/businessStats"
import AddAllocationModal from "@/components/admin/business/AddAllocationModal"
import { BusinessAllocationsTable } from "@/components/admin/business/BusinessAllocationTable"
import { columns } from "@/components/admin/business/Columns"
import { 
  mockBusinessVentures, 
  mockInvestmentCycles, 
  mockUsers 
} from "@/db"
import type { BusinessVentureWithDetails } from "@/db/types"

const BusinessManagementPage = () => {
  // Filter committee members from users
  const committeeMembers = mockUsers.filter((user) => user.role === "committee")
  
  // Transform ventures with related data for display
  const venturesWithDetails: BusinessVentureWithDetails[] = mockBusinessVentures.map((venture) => {
    const cycle = mockInvestmentCycles.find((c) => c.id === venture.cycleId)
    const manager = mockUsers.find((u) => u.id === venture.managedBy)
    
    return {
      ...venture,
      managerName: manager?.fullName || "Unknown",
      cycleName: cycle?.name || "Unknown Cycle",
      status: (venture.profitRealized ?? 0n) > 0n ? "completed" : "active",
    }
  })

  // Calculate total capital allocated (all active ventures)
  const totalCapital = venturesWithDetails
    .filter((venture) => venture.status === "active")
    .reduce((sum, venture) => sum + venture.allocatedAmount, 0n)

  // Calculate total profit realized (all completed ventures)
  const totalProfit = venturesWithDetails
    .filter((venture) => venture.status === "completed")
    .reduce((sum, venture) => sum + (venture.profitRealized ?? 0n), 0n)

  return (
    <div className="flex flex-col gap-6 p-4 sm:p-6 lg:p-8 max-w-[1600px] mx-auto">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <HeaderBox
          title="Business Venture Management"
          subtext="Track capital allocations and investment returns"
        />
        <div className="w-full sm:w-auto">
          <AddAllocationModal 
            cycles={mockInvestmentCycles}
            committeeMembers={committeeMembers}
          />
        </div>
      </div>

      <BusinessStatsCards totalCapital={totalCapital} totalProfit={totalProfit} />

      <BusinessAllocationsTable columns={columns} data={venturesWithDetails} />
    </div>
  )
}

export default BusinessManagementPage