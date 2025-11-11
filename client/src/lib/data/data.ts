import { mockBusinessVentures, mockData, mockInvestmentCycles, mockUsers } from "@/db";
import type { ActivityItem, KpiData, UserTableType } from "@/lib/types/dashboard";
import type { InvestmentCycle, ShareholderInvestment, WithdrawalRequest, User, UserProfile, Wallet, BusinessVentureWithDetails } from "@/db/types";

// Helper: safe conversion of bigint | number | undefined to number (kobo integer)
const toNumberKobo = (v: bigint | number | undefined | null): number => {
  if (v == null) return 0;
  if (typeof v === "bigint") return Number(v);
  if (typeof v === "number") return Number(v);
  return 0;
};

/**
 * Calculates the four main Key Performance Indicators for the dashboard.
 * Returns amounts as integer kobo (number) so callers can pass them to formatCurrency.
 */
export async function getKpiData(): Promise<KpiData> {
  const activeCycles: InvestmentCycle[] = mockData.investmentCycles.filter((cycle) => cycle.status === "active");
  const activeCycleIds = new Set(activeCycles.map((c: InvestmentCycle) => c.id));

  const totalCapitalUnderManagement = mockData.shareholderInvestments
    .filter((inv: ShareholderInvestment) => activeCycleIds.has(inv.cycleId))
    .reduce((sum: number, inv: ShareholderInvestment) => sum + toNumberKobo(inv.amountInvested), 0);

  const totalProfitDistributed = mockData.investmentCycles
    .filter((c: InvestmentCycle) => c.profitDistributionStatus === "completed" || c.status === "completed")
    .reduce((sum: number, c: InvestmentCycle) => sum + toNumberKobo(c.investorProfitPool), 0);

  const activeInvestorIds = new Set(
    mockData.shareholderInvestments
      .filter((inv: ShareholderInvestment) => activeCycleIds.has(inv.cycleId))
      .map((inv: ShareholderInvestment) => inv.userId)
  );

  const pendingWithdrawals = mockData.withdrawalRequests.filter((r: WithdrawalRequest) => r.status === "pending").length;

  return {
    totalCapitalUnderManagement,
    totalProfitDistributed,
    activeInvestors: activeInvestorIds.size,
    pendingWithdrawals,
  };
}

/**
 * Fetches details for the primary active investment cycle.
 * Returns capitalRaised as integer kobo.
 */
export async function getCurrentCycleDetails() {
  const activeCycle = mockData.investmentCycles.find((c: InvestmentCycle) => c.status === "active");
  if (!activeCycle) return null;
  if (!activeCycle.startDate || !activeCycle.endDate) return null;

  const today = new Date();
  const startDate = new Date(activeCycle.startDate);
  const endDate = new Date(activeCycle.endDate);

  const totalDuration = Math.max(1, endDate.getTime() - startDate.getTime());
  const elapsed = Math.min(Math.max(0, today.getTime() - startDate.getTime()), totalDuration);
  const progress = Math.round((elapsed / totalDuration) * 100);
  const daysRemaining = Math.max(0, Math.ceil((endDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24)));

  const investmentsInCycle = mockData.shareholderInvestments.filter((inv: ShareholderInvestment) => inv.cycleId === activeCycle.id);
  const capitalRaised = investmentsInCycle.reduce((sum: number, inv: ShareholderInvestment) => sum + toNumberKobo(inv.amountInvested), 0);
  const investorCount = new Set(investmentsInCycle.map((inv: ShareholderInvestment) => inv.userId)).size;

  return {
    id: activeCycle.id,
    name: activeCycle.name,
    progress,
    daysRemaining,
    capitalRaised,
    investorCount,
  };
}

/**
 * Creates a sorted list of recent platform activities (registrations, investments, withdrawals).
 */
export async function getRecentActivity(): Promise<ActivityItem[]> {
  const registrations: ActivityItem[] = mockData.users.map((user: User) => ({
    type: "registration",
    description: `${user.fullName} just registered.`,
    timestamp: new Date(user.createdAt),
  }));

  const investments: ActivityItem[] = mockData.shareholderInvestments.map((inv: ShareholderInvestment) => {
    const user = mockData.users.find((u: User) => u.id === inv.userId);
    return {
      type: "investment",
      description: `${user?.fullName ?? "A user"} invested ${Number(inv.shares)} shares (₦${(Number(inv.amountInvested) / 100).toLocaleString()}).`,
      timestamp: new Date(inv.createdAt),
    };
  });

  const withdrawals: ActivityItem[] = mockData.withdrawalRequests.map((req: WithdrawalRequest) => {
    const user = mockData.users.find((u: User) => u.id === req.userId);
    return {
      type: "withdrawal",
      description: `${user?.fullName ?? "A user"} requested a withdrawal.`,
      timestamp: new Date(req.requestedAt),
    };
  });

  const all = [...registrations, ...investments, ...withdrawals];
  return all.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime()).slice(0, 5);
}

/**
 * Returns counts of tasks that require admin attention.
 */
export async function getPendingTasks() {
  const withdrawalCount = mockData.withdrawalRequests.filter((r: WithdrawalRequest) => r.status === "pending").length;
  // Accept multiple statuses as 'pending' depending on schema values
  const pendingStatuses = new Set<string>(["pending_review", "not_submitted", "pending"]);
  const kycCount = mockData.userProfiles.filter((p: UserProfile) => pendingStatuses.has(String(p.kycStatus))).length;
  return { withdrawalCount, kycCount };
}

/**
 * Returns enriched pending withdrawals for admin UI.
 * Kept here so all consumers use a single source of truth (mockData for now).
 */
export function getPendingWithdrawals(): (WithdrawalRequest & { user: Pick<User, 'fullName' | 'email'> })[] {
  const pending = mockData.withdrawalRequests.filter((req) => req.status === "pending");

  return pending.map((req) => {
    const user = mockData.users.find((u) => u.id === req.userId);
    return {
      ...req,
      user: {
        fullName: user?.fullName || "Unknown User",
        email: user?.email || "No email",
      },
    };
  });
}

/**
 * Build detailed cycle information for admin UI, mirroring logic from the admin page.
 */
export function getCycleDetails(cycleId: number) {

  const baseCycle = mockData.investmentCycles.find((c) => c.id === cycleId);
  if (!baseCycle) return null;

  const totalCapitalInvested = mockData.shareholderInvestments
    .filter((inv) => inv.cycleId === cycleId)
    .reduce((sum: bigint, inv) => sum + inv.amountInvested, 0n);

  const investors = mockData.shareholderInvestments
    .filter((inv) => inv.cycleId === cycleId)
    .map((inv) => {
      const user = mockData.users.find((u) => u.id === inv.userId);
      const memberName = user ? user.fullName : `User ${inv.userId}`;

      let sharePercentage = 0;
      if (totalCapitalInvested > 0n) {
        const pctTimes100 = (inv.amountInvested * 10000n) / totalCapitalInvested;
        sharePercentage = Number(pctTimes100) / 100;
      }

      return {
        id: String(inv.id),
        memberName,
        shares: inv.shares,
        amountInvested: inv.amountInvested,
        sharePercentage,
        profitEarned: inv.profitEarned ?? undefined,
        amountWithProfit: inv.amountInvested + (inv.profitEarned || 0n),
      };
    });

  const ventures = mockData.businessVentures
    .filter((v) => v.cycleId === cycleId)
    .map((v) => ({
      id: String(v.id),
      managedBy: mockData.users.find((u) => u.id === v.managedBy)?.fullName || "Unknown",
      ventureName: v.companyName,
      allocatedAmount: v.allocatedAmount,
      expectedProfit: v.expectedProfit,
      profitRealized: v.profitRealized ?? undefined,
    }));

  const totalSharesSold = mockData.shareholderInvestments
    .filter((inv) => inv.cycleId === cycleId)
    .reduce((sum, inv) => sum + inv.shares, 0);

  const numberOfInvestors = new Set(
    mockData.shareholderInvestments
      .filter((inv) => inv.cycleId === cycleId)
      .map((i) => i.userId)
  ).size;

  const profitRealized = baseCycle.totalProfitRealized || 0n;
  const investorPool = baseCycle.investorProfitPool || 0n;
  const organizationalShare = baseCycle.organizationProfitShare || 0n;

  const status: "Active" | "Completed" | "Pending" = baseCycle.status === "active" ? "Active" : baseCycle.status === "completed" ? "Completed" : "Pending";

  return {
    id: String(baseCycle.id),
    name: baseCycle.name,
    status,
    totalCapitalInvested,
    totalSharesSold,
    numberOfInvestors,
    profitRealized,
    investorPool,
    organizationalShare,
    investors,
    ventures,
  };
}


/**
 * Returns users shaped for the users table.
 */
export async function getUsersForTable(): Promise<UserTableType[]> {
  return mockData.users.map((user: User) => {
    const profile = mockData.userProfiles.find((p: UserProfile) => p.userId === user.id);
    const wallet = mockData.wallets.find((w: Wallet) => w.userId === user.id);
    return {
      id: user.id,
      fullName: user.fullName,
      email: user.email,
      role: user.role as UserTableType["role"],
      kycStatus: (profile?.kycStatus as UserTableType["kycStatus"]) ?? "pending",
      balance: toNumberKobo(wallet?.balance ?? 0),
      createdAt: new Date(user.createdAt),
    };
  });
}

/**
 * Fetches all related details for a single user profile.
 */
export async function getUserProfileDetails(userId: number): Promise<{
  user: User;
  profile?: any;
  investments: any[];
  transactions: any[];
  withdrawals: any[];
} | null> {
  const user = mockData.users.find((u: User) => u.id === userId);
  if (!user) return null;

  const profile = mockData.userProfiles.find((p: UserProfile) => p.userId === userId) || undefined;

  const investments = mockData.shareholderInvestments
    .filter((inv: ShareholderInvestment) => inv.userId === userId)
    .map((inv: ShareholderInvestment) => {
      const cycle = mockData.investmentCycles.find((c) => c.id === inv.cycleId);
      return {
        ...inv,
        // Ensure profitEarned is always bigint
        profitEarned: inv.profitEarned ?? 0n,
        // leave createdAt as-is (mock uses Date)
        createdAt: inv.createdAt,
        cycleName: cycle ? cycle.name : "Unknown",
        status: cycle?.status ?? null,
      };
    });
  const transactions = mockData.transactions.filter((t) => t.userId === userId);
  const withdrawals = mockData.withdrawalRequests.filter((w) => w.userId === userId);

  // Return raw profile from mock data (string dates preserved). UI components should handle rendering.
  return { user, profile, investments, transactions, withdrawals };
}

export default {};
