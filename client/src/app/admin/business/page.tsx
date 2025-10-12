import HeaderBox from "@/components/common/HeaderBox"
import BusinessStatsCards from "@/components/admin/business/businessStats"
import AddAllocationModal from "@/components/admin/business/AddAllocationModal"
import { BusinessAllocationsTable } from "@/components/admin/business/BusinessAllocationTable"
import { columns } from "@/components/admin/business/Columns"
import { businessAllocations } from "@/lib/data/Businessdata"

const BusinessManagementPage = () => {
  const totalCapital = businessAllocations
    .filter((allocation) => allocation.status === "Active")
    .reduce((sum, allocation) => sum + allocation.allocatedAmount, 0)

  const totalProfit = businessAllocations
    .filter((allocation) => allocation.status === "Completed")
    .reduce((sum, allocation) => sum + (allocation.profitRealized || 0), 0)

  return (
    <div className="flex flex-col gap-6 p-4 sm:p-6 lg:p-8 max-w-[1600px] mx-auto">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <HeaderBox
          title="Business Venture Management"
          subtext="Track capital allocations and investment returns"
        />
        <div className="w-full">
          <AddAllocationModal />
        </div>
      </div>

      <BusinessStatsCards totalCapital={totalCapital} totalProfit={totalProfit} />

      <BusinessAllocationsTable columns={columns} data={businessAllocations} />
    </div>
  )
}

export default BusinessManagementPage