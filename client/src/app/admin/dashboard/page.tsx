"use client";

import { KpiCard } from "@/components/admin/dahsboard/KpiCard";
import { CurrentCycleCard } from "@/components/admin/dahsboard/CurrenCycleCard";
import { RecentActivityFeed } from "@/components/admin/dahsboard/RecenActivity";
import { PendingTasksCard } from "@/components/admin/dahsboard/pendingCard";
import {
  KpiCardSkeleton,
  CurrentCycleCardSkeleton,
  PendingTasksCardSkeleton,
  RecentActivityFeedSkeleton,
} from "@/components/admin/dahsboard/dashboard-skeletons";

import {
  useGetDashboardKpiQuery,
  useGetCurrentCycleDetailsQuery,
  useGetRecentActivitiesQuery,
  useGetPendingTasksQuery,
} from "@/store/modules/dashboard";

import { formatCurrency } from "@/lib/utils";
import { Banknote, Users, TrendingUp, AlertTriangle } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

export default function AdminDashboardPage() {
  // Fetch all data in parallel with RTK Query
  const { data: kpiData, isLoading: kpiLoading, error: kpiError } = useGetDashboardKpiQuery();
  const { data: cycleData, isLoading: cycleLoading, error: cycleError } = useGetCurrentCycleDetailsQuery();
  const { data: activitiesData, isLoading: activitiesLoading, error: activitiesError } = useGetRecentActivitiesQuery({ limit: 10 });
  const { data: tasksData, isLoading: tasksLoading, error: tasksError } = useGetPendingTasksQuery();

  // Extract data with fallbacks
  const kpi = kpiData?.data;
  const cycle = cycleData?.data;
  const activities = activitiesData?.data || [];
  const tasks = tasksData?.data;

  return (
    <div className="flex-1 space-y-4 p-4 pt-6 md:p-8">
      <h2 className="text-3xl font-bold tracking-tight">Dashboard</h2>

      {/* KPIs Section - Mobile: 2x2 grid, Desktop: 4x1 grid */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {kpiLoading || kpiError ? (
          <>
            <KpiCardSkeleton />
            <KpiCardSkeleton />
            <KpiCardSkeleton />
            <KpiCardSkeleton />
          </>
        ) : kpi ? (
          <>
            <KpiCard
              title="Total Capital Under Management"
              value={formatCurrency(parseInt(kpi.totalCapitalUnderManagement) / 100)}
              icon={<Banknote className="h-4 w-4 text-muted-foreground" />}
            />
            <KpiCard
              title="Total Profit Distributed"
              value={formatCurrency(parseInt(kpi.totalProfitDistributed) / 100)}
              icon={<TrendingUp className="h-4 w-4 text-muted-foreground" />}
            />
            <KpiCard
              title="Active Investors"
              value={kpi.activeInvestors.toString()}
              icon={<Users className="h-4 w-4 text-muted-foreground" />}
            />
            <KpiCard
              title="Pending Withdrawals"
              value={kpi.pendingWithdrawals.toString()}
              icon={<AlertTriangle className="h-4 w-4 text-yellow-600" />}
              isActionable={true}
            />
          </>
        ) : (
          <Card className="col-span-4 flex items-center justify-center">
            <CardContent className="pt-6">
              <p className="text-center text-muted-foreground">Failed to load dashboard metrics.</p>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Main Content Area - Mobile: single column, Desktop: multi-column grid */}
      <div className="grid gap-4 lg:grid-cols-3">
        {cycleLoading ? <CurrentCycleCardSkeleton /> : <CurrentCycleCard data={cycle || null} />}

        {/* The following cards will stack on mobile and sit beside the cycle card on desktop */}
        <div className="space-y-4">
          {tasksLoading ? (
            <PendingTasksCardSkeleton />
          ) : tasks ? (
            <PendingTasksCard
              withdrawalCount={tasks.pendingWithdrawalsCount}
              kycCount={tasks.pendingKycCount}
            />
          ) : null}

          {activitiesLoading ? <RecentActivityFeedSkeleton /> : <RecentActivityFeed activities={activities} />}
        </div>
      </div>
    </div>
  );
}
