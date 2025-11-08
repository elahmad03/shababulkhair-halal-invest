import HeaderBox from "@/components/common/HeaderBox"
import PortfolioSummaryCards from "@/components/user/investments/PortfolioSummaryCard"
import InvestmentCard from "@/components/user/investments/InvestmentCard"
import { InvestmentsTable } from "@/components/user/investments/InvestmentsTable"
import { columns, type InvestmentTableRow } from "@/components/user/investments/Columns"
import { 
  mockShareholderInvestments, 
  mockInvestmentCycles 
} from "@/db"

const MyInvestmentsPage = () => {
  // In real app, get current user from auth
  const currentUserId = 1

  // Filter investments for current user
  const userInvestments = mockShareholderInvestments.filter(
    (inv) => inv.userId === currentUserId
  )

  // Transform data with cycle information
  const investmentsWithCycles = userInvestments.map((investment) => {
    const cycle = mockInvestmentCycles.find((c) => c.id === investment.cycleId)
    return {
      id: investment.id,
      cycleName: cycle?.name || "Unknown Cycle",
      cycleStatus: cycle?.status || "pending",
      shares: investment.shares,
      amountInvested: investment.amountInvested,
      profitEarned: investment.profitEarned,
      investedAt: investment.createdAt,
    }
  })

  // Calculate summary metrics
  const activeStaked = investmentsWithCycles
    .filter((inv) => inv.cycleStatus === "active")
    .reduce((sum, inv) => sum + inv.amountInvested, 0n)

  const lifetimeProfit = investmentsWithCycles
    .filter((inv) => inv.cycleStatus === "completed")
    .reduce((sum, inv) => sum + inv.profitEarned, 0n)

  // Sort by date, newest first
  const sortedInvestments = [...investmentsWithCycles].sort(
    (a, b) => b.investedAt.getTime() - a.investedAt.getTime()
  )

  return (
    <div className="flex flex-col gap-6 p-4 sm:p-6 lg:p-8 max-w-[1600px] mx-auto">
      <HeaderBox
        title="My Portfolio"
        subtext="Track your investments and earnings"
      />

      <PortfolioSummaryCards
        activeStaked={activeStaked}
        lifetimeProfit={lifetimeProfit}
      />

      {/* Mobile: Card View */}
      <div className="lg:hidden space-y-4">
        {sortedInvestments.length > 0 ? (
          sortedInvestments.map((investment) => (
            <InvestmentCard key={investment.id} {...investment} />
          ))
        ) : (
          <div className="text-center py-12 text-muted-foreground">
            <p className="text-sm">No investments yet</p>
            <p className="text-xs mt-1">Start investing to build your portfolio</p>
          </div>
        )}
      </div>

      {/* Desktop: Table View */}
      <div className="hidden lg:block">
        <InvestmentsTable columns={columns} data={sortedInvestments} />
      </div>
    </div>
  )
}

export default MyInvestmentsPage