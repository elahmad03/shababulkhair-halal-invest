'use client';

import HeaderBox from "@/components/common/HeaderBox";
import PortfolioSummaryCards from "@/components/user/investments/PortfolioSummaryCard";
import InvestmentCard, { type InvestmentCardProps } from "@/components/user/investments/InvestmentCard";
import { InvestmentsTable } from "@/components/user/investments/InvestmentsTable";
import { columns, type InvestmentTableRow } from "@/components/user/investments/Columns";
import { 
  mockShareholderInvestments, 
  mockInvestmentCycles 
} from "@/db";

const MyInvestmentsPage = () => {
  // In real app, get current user from auth
  const currentUserId = 1;

  // Filter investments for current user
  const userInvestments = mockShareholderInvestments.filter(
    (inv) => inv.userId === currentUserId
  );

  // Transform data with cycle information, ensuring all types are correct
  const investmentsWithCycles: InvestmentTableRow[] = userInvestments.map((investment) => {
    const cycle = mockInvestmentCycles.find((c) => c.id === investment.cycleId);

    // Ensure profitEarned and amountInvested are BigInt (never null)
    const safeAmountInvested = BigInt(investment.amountInvested ?? 0);
    const safeProfitEarned = BigInt(investment.profitEarned ?? 0);

    return {
      id: investment.id,
      cycleName: cycle?.name || "Unknown Cycle",
      cycleStatus: cycle?.status || "pending",
      shares: investment.shares,
      amountInvested: safeAmountInvested,
      profitEarned: safeProfitEarned,
      investedAt: new Date(investment.createdAt),
    };
  });

  // Calculate summary metrics
  const activeStaked = investmentsWithCycles
    .filter((inv) => inv.cycleStatus === "active")
    .reduce((sum, inv) => sum + inv.amountInvested, 0n);

  const lifetimeProfit = investmentsWithCycles
    .filter((inv) => inv.cycleStatus === "completed")
    .reduce((sum, inv) => sum + inv.profitEarned, 0n);

  // Sort by date, newest first
  const sortedInvestments = [...investmentsWithCycles].sort(
    (a, b) => new Date(b.investedAt).getTime() - new Date(a.investedAt).getTime()
  );

  return (
    <div className="flex flex-col gap-6 p-4 sm:p-6 lg:p-8 max-w-[1600px] mx-auto">
      <HeaderBox
        title="My Investments"
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
            <InvestmentCard key={investment.id} {...(investment as InvestmentCardProps)} />
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
        {sortedInvestments.length > 0 ? (
          <InvestmentsTable columns={columns} data={sortedInvestments} />
        ) : (
          <div className="text-center py-12 text-muted-foreground">
            <p className="text-sm">No investments found</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default MyInvestmentsPage;
