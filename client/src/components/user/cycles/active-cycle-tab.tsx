'use client';

import { useRouter } from 'next/navigation';
import { CycleCard } from './cycle-card';
import { useGetMemberInvestmentHistoryQuery, useListCyclesQuery } from '@/store/hooks';
import { formatCurrency } from '@/lib/utils';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { AlertCircle, Loader2 } from 'lucide-react';

export function ActiveCyclesTab() {
  const router = useRouter();
  const { data: historyResponse, isLoading: historyLoading, isError: historyError, error: historyErrorData } = useGetMemberInvestmentHistoryQuery();
  const { data: cyclesResponse, isLoading: cyclesLoading } = useListCyclesQuery({ page: 1, limit: 50 });

  const userInvestments = historyResponse?.data?.filter(inv => inv.cycle?.status === 'ACTIVE') ?? [];
  const allCycles = cyclesResponse?.data?.data ?? [];

  const isLoading = historyLoading || cyclesLoading;
  const isError = historyError;
  const error = historyErrorData;

  const handleViewDetails = (cycleId: string) => {
    router.push(`/user/cycles/${cycleId}`);
  };

  // Loading state
  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center space-y-4">
          <Loader2 className="h-8 w-8 animate-spin mx-auto text-primary" />
          <p className="text-muted-foreground">Loading your active investments...</p>
        </div>
      </div>
    );
  }

  // Error state
  if (isError) {
    const errorMessage = 
      error && 'data' in error && typeof error.data === 'object' && error.data !== null && 'message' in error.data
        ? (error.data as { message: string }).message
        : "Failed to load investments. Please try again.";
    
    return (
      <Alert variant="destructive">
        <AlertCircle className="h-4 w-4" />
        <AlertDescription>
          {errorMessage}
        </AlertDescription>
      </Alert>
    );
  }

  // Empty state
  if (userInvestments.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-muted-foreground text-lg">
          You don't have any active investments yet.
        </p>
      </div>
    );
  }

  return (
    <section aria-label="Active Investments" className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {userInvestments.map((investment) => {
        const cycle = allCycles.find(c => c.id === investment.cycleId) ?? investment.cycle;

        if (!cycle) return null;

        const maturityDate = investment.cycle?.activeEndsAt || cycle.activeEndsAt;

        return (
          <CycleCard
            key={investment.cycleId}
            title={cycle.cycleName}
            status="ACTIVE"
            details={[
              {
                label: 'My Investment',
                value: formatCurrency(Number(investment.amountInvestedKobo)),
              },
              {
                label: 'Shares Held',
                value: Number(investment.sharesAllocated).toLocaleString(),
              },
              {
                label: 'Share Price',
                value: formatCurrency(Number(cycle.pricePerShareNaira)),
              },
              {
                label: 'Cycle Maturity',
                value: maturityDate
                  ? new Date(maturityDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
                  : '-',
              },
            ]}
            buttonText="View Details"
            buttonVariant="outline"
            onButtonClick={() => handleViewDetails(cycle.id)}
          />
        );
      })}
    </section>
  );
}