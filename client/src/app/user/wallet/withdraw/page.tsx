import { WithdrawalRequestForm } from "@/components/user/withdrawals/WithrawalsRequestForm";
import { WithdrawalHistory } from "@/components/user/withdrawals/WithdrawalsHistory";
import { Separator } from "@/components/ui/separator";
import HeaderBox from "@/components/common/HeaderBox";
import {
  mockWithdrawalRequests,
  mockInvestmentCycles,
  mockShareholderInvestments,
  mockWallets,
} from "@/db";
import { koboToNgn } from "@/lib/utils";

// Helper function to find user-specific data from the mock dataset
const getUserWithdrawalData = (userId: number) => {
  const userWallet = mockWallets.find((w) => w.userId === userId);
  // Use the standard withdrawal requests for history so it matches the WithdrawalRequest schema
  const userWithdrawalHistory = mockWithdrawalRequests.filter((req) => req.userId === userId);

  // Find completed investments for the user
  const completedCycles = mockInvestmentCycles.filter(
    (cycle) => cycle.status === "completed"
  );
  const completedCycleIds = completedCycles.map((cycle) => cycle.id);

  const userCompletedInvestments = mockShareholderInvestments
    .filter(
      (inv) => inv.userId === userId && completedCycleIds.includes(inv.cycleId)
    )
    .map((investment) => {
      const cycleInfo = completedCycles.find((c) => c.id === investment.cycleId);
      return {
        ...investment,
        // normalize profitEarned to ensure it matches the ShareholderInvestment schema (non-null bigint)
        profitEarned: investment.profitEarned ?? 0n,
        cycleName: cycleInfo?.name || "Unknown Cycle",
      };
    });

  return {
    // Keep wallet balance as bigint (kobo) to match DB schema and component expectations
    walletBalance: userWallet?.balance ?? 0n,
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
      <HeaderBox
        title="Withdraw Funds"
        subtext="Request a withdrawal from your account."
      />
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