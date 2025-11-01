// app/(app)/dashboard/page.tsx (Final UI)
import {
  mockInvestmentCycles,
  mockShareholderInvestments,
  mockUsers,
  mockWallets,
  mockWithdrawalRequests,
} from "@/db";
import { StatCard } from "@/components/widgets/Statscard";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  DollarSign,
  TrendingUp,
  Wallet,
  ArrowRight,
  Clock,
  Handshake,
} from "lucide-react";
import Link from "next/link";
import HeaderBox from "@/components/common/HeaderBox";
import { formatCurrency } from "@/lib/utils";
import BarChart from "@/components/widgets/Chart";

const currentUser = mockUsers.find((u) => u.id === 3);
const userWallet = mockWallets.find((w) => w.userId === 3);
const userInvestments = mockShareholderInvestments.filter(
  (i) => i.userId === 3
);
const pendingWithdrawals = mockWithdrawalRequests.filter(
  (w) => w.userId === 3 && w.status === "pending"
);

const totalInvested = userInvestments.reduce(
  (sum, inv) => sum + Number(inv.amountInvested),
  0
);
const totalProfit = userInvestments.reduce(
  (sum, inv) => sum + Number(inv.profitEarned),
  0
);

export default function DashboardPage() {
  const welcomeName = currentUser?.fullName.split(" ")[0] || "Member";

  // Prepare data for chart: show total profit realized per cycle (NGN)
  const profitByCycle = mockInvestmentCycles
    .filter((c) => Number(c.totalProfitRealized) > 0)
    .map((c) => ({
      label: c.name.replace(" 2025", ""),
      // convert bigint (kobo) to NGN number for chart readability
      value: Number(c.totalProfitRealized) / 100,
    }))
    .slice(-6); // show last 6 cycles

  return (
    <div className="space-y-10">
      {/* 1. Welcome Header */}
      <HeaderBox
        title={`Welcome,  ${welcomeName}`}
        subtext="your ethical overview for shababulkhair"
        user={welcomeName}
      />

      {/* 2. Key Financial Stats */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        <StatCard
          title="Wallet Balance"
          value={`${formatCurrency(userWallet?.balance) || "0.00"}`}
          subtext="Available for transactions."
          Icon={Wallet}
          color="text-ember-green-700 dark:text-ember-green-500"
        />
        <StatCard
          title="Total Invested"
          value={`${formatCurrency(totalInvested)}`}
          subtext={`${userInvestments.length} active cycles.`}
          Icon={DollarSign}
          color="text-blue-500 dark:text-blue-400"
        />
        <StatCard
          title="Cumulative Profit"
          value={`${formatCurrency(totalProfit)}`}
          subtext="Total earnings since joining."
          Icon={TrendingUp}
          color="text-green-600 dark:text-green-400"
        />
        <StatCard
          title="Pending Requests"
          value={pendingWithdrawals.length.toString()}
          subtext="Withdrawal or share purchase requests."
          Icon={Clock}
          color="text-amber-500 dark:text-amber-400"
        />
      </div>

      {/* 3. Actions and Overview */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Investment Cycles (Prominent) */}
        <Card className="lg:col-span-2 shadow-xl">
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="text-2xl font-semibold">
              Current Investment Cycles
            </CardTitle>
            <Link href="/user/cycles" passHref>
              <Button
                variant="ghost"
                className="text-ember-green-700 dark:text-ember-green-500"
              >
                View All <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </Link>
          </CardHeader>
          <CardContent>
            {/* Chart overview: Profit realized by cycle */}
            <div className="mb-4">
              <CardTitle className="text-base font-medium mb-2">Recent Profit Overview</CardTitle>
              <BarChart data={profitByCycle} height={120} />
            </div>
            {/* Table/List component here for mockData.shareholderInvestments */}
            {userInvestments.length > 0 ? (
              <ul className="space-y-3">
                {userInvestments.slice(0, 3).map((inv, index) => (
                  <li
                    key={index}
                    className="flex justify-between items-center p-3 border-b dark:border-gray-800 last:border-b-0 hover:bg-gray-50 dark:hover:bg-gray-900 rounded-md"
                  >
                    <div className="flex items-center space-x-3">
                      <Handshake className="h-5 w-5 text-ember-green-500" />
                      <div>
                        <p className="font-medium text-gray-800 dark:text-gray-100">
                          {mockInvestmentCycles.find(
                            (c) => c.id === inv.cycleId
                          )?.name || `Cycle ${inv.cycleId}`}
                        </p>
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                          {inv.shares} Shares
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold text-base">
                         {formatCurrency(inv.amountInvested)}
                      </p>
                      <p className="text-xs text-green-600 dark:text-green-400">
                        +{formatCurrency(inv.profitEarned)}
                      </p>
                    </div>
                  </li>
                ))}
              </ul>
            ) : (
              <CardDescription>
                You have no active investments. Start a new cycle today!
              </CardDescription>
            )}
          </CardContent>
        </Card>

        {/* Quick Actions (Sidebar) */}
        <Card className="shadow-lg bg-ember-green-50 dark:bg-gray-800/50">
          <CardHeader>
            <CardTitle className="text-xl font-semibold text-ember-green-700 dark:text-ember-green-500">
              Quick Actions
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <Button
              asChild
              className="w-full justify-start py-6 text-base bg-ember-green-600 hover:bg-ember-green-700 dark:bg-ember-green-700 dark:hover:bg-ember-green-600 transition-colors"
            >
              <Link href="/wallet/deposit">Deposit Funds</Link>
            </Button>
            <Button
              asChild
              variant="secondary"
              className="w-full justify-start py-6 text-base text-gray-700 dark:text-gray-100 dark:hover:bg-gray-700 transition-colors"
            >
              <Link href="/wallet/withdraw">Request Withdrawal</Link>
            </Button>
            <Button
              asChild
              variant="outline"
              className="w-full justify-start py-6 text-base border-ember-green-700 text-ember-green-700 hover:bg-ember-green-50 dark:border-ember-green-500 dark:text-ember-green-500 dark:hover:bg-gray-700 transition-colors"
            >
              <Link href="/investment/{id}">Purchase Shares</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
