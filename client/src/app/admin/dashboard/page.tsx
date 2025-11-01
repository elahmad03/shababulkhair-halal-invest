// /app/admin/dashboard/page.tsx

import { KpiCard } from "@/components/admin/dahsboard/KpiCard";
import { CurrentCycleCard } from "@/components/admin/dahsboard/CurrenCycleCard";
import { RecentActivityFeed } from "@/components/admin/dahsboard/RecenActivity";
import { PendingTasksCard } from "@/components/admin/dahsboard/pendingCard";
import { getKpiData, getCurrentCycleDetails, getRecentActivity, getPendingTasks } from "@/lib/data/data";
import { formatCurrency } from "@/lib/utils";
import { Banknote, Users, TrendingUp, AlertTriangle } from "lucide-react";
import { ProfitChart } from "@/components/user/dashboard/charts";

// This makes the page automatically refresh its data periodically
export const revalidate = 60; // Revalidate every 60 seconds

export default async function AdminDashboardPage() {
  // Fetch all data in parallel
  const [kpiData, currentCycle, recentActivity, pendingTasks] = await Promise.all([
    getKpiData(),
    getCurrentCycleDetails(),
    getRecentActivity(),
    getPendingTasks(),
  ]);

  return (
    <div className="flex-1 space-y-4 p-4 pt-6 md:p-8">
      <h2 className="text-3xl font-bold tracking-tight">Dashboard</h2>

      {/* KPIs Section - Mobile: 2x2 grid, Desktop: 4x1 grid */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <KpiCard
          title="Total Capital Under Management"
          value={formatCurrency(kpiData.totalCapitalUnderManagement)}
          icon={<Banknote className="h-4 w-4 text-muted-foreground" />}
        />
        <KpiCard
          title="Total Profit Distributed"
          value={formatCurrency(kpiData.totalProfitDistributed)}
          icon={<TrendingUp className="h-4 w-4 text-muted-foreground" />}
        />
        <KpiCard
          title="Active Investors"
          value={kpiData.activeInvestors.toString()}
          icon={<Users className="h-4 w-4 text-muted-foreground" />}
        />
        <KpiCard
          title="Pending Withdrawals"
          value={kpiData.pendingWithdrawals.toString()}
          icon={<AlertTriangle className="h-4 w-4 text-yellow-600" />}
          isActionable={true}
        />
      </div>

      {/* Main Content Area - Mobile: single column, Desktop: multi-column grid */}
      <div className="grid gap-4 lg:grid-cols-3">
        <ProfitChart />

        <CurrentCycleCard data={currentCycle} />
        {/* The following cards will stack on mobile and sit beside the cycle card on desktop */}
        <div className="space-y-4">
          <PendingTasksCard 
            withdrawalCount={pendingTasks.withdrawalCount}
            kycCount={pendingTasks.kycCount}
          />
          <RecentActivityFeed activities={recentActivity} />
        </div>
      </div>
    </div>
  );
}