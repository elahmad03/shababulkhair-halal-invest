import { WithdrawalRequestForm } from "@/components/user/withdrawals/WithrawalsRequestForm";
import { WithdrawalHistory } from "@/components/user/withdrawals/WithdrawalsHistory";
import { Separator } from "@/components/ui/separator";
import { mockData } from "@/db/mockData"; // Assuming mock data is in lib
import { InvestmentCycle, ShareholderInvestment } from "@/schemas/app";
import HeaderBox from "@/components/common/HeaderBox";

// Helper function to find user-specific data from the mock dataset
const getUserWithdrawalData = (userId: number) => {
  const userWallet = mockData.wallets.find((w) => w.userId === userId);
  const userWithdrawalHistory = mockData.withdrawalRequests.filter(
    (req) => req.userId === userId
  );

  // Find completed investments for the user
  const completedCycles = mockData.investmentCycles.filter(
    (cycle) => cycle.status === "completed"
  );
  const completedCycleIds = completedCycles.map((cycle) => cycle.id);

  const userCompletedInvestments = mockData.shareholderInvestments
    .filter(
      (inv) =>
        inv.userId === userId && completedCycleIds.includes(inv.cycleId)
    )
    .map((investment) => {
      const cycleInfo = completedCycles.find(
        (c) => c.id === investment.cycleId
      );
      return {
        ...investment,
        cycleName: cycleInfo?.name || "Unknown Cycle",
      };
    });

  return {
    walletBalance: userWallet?.balance || 0,
    withdrawalHistory: userWithdrawalHistory,
    completedInvestments: userCompletedInvestments,
  };
};

export default function WithdrawalPage() {
  // We'll use a hardcoded user ID for this example page.
  // In a real app, this would come from the user's session.
  const LOGGED_IN_USER_ID = 3;

  const { walletBalance, withdrawalHistory, completedInvestments } =
    getUserWithdrawalData(LOGGED_IN_USER_ID);

  return (
    <div className="flex flex-col gap-8 p-4 md:p-8">
      <HeaderBox title="Withdraw Funds" subtext="Request a withdrawal from your account." />
      {/* Section 1: New Withdrawal Request Form */}
      <WithdrawalRequestForm
        walletBalance={walletBalance}
        completedInvestments={completedInvestments}
      />

      <Separator />

      {/* Section 2: Withdrawal History Table */}
      <WithdrawalHistory history={withdrawalHistory} />
    </div>
  );
}