'use client';

import { mockInvestmentCycles, mockShareholderInvestments } from '@/db'; 
import { CycleCard } from './cycle-card';
import { useRouter } from 'next/navigation';

// You'll need to get the current user ID from your auth context
const CURRENT_USER_ID = 2; // Replace with actual auth context

export function ActiveCyclesTab() {
  const router = useRouter();

  // Get user's active investments
  const userActiveInvestments = mockShareholderInvestments.filter(
    (investment) => {
      const cycle = mockInvestmentCycles.find(
        (c) => c.id === investment.cycleId && c.status === 'active'
      );
      return investment.userId === CURRENT_USER_ID && cycle;
    }
  );

  const handleViewDetails = (cycleId: number) => {
    router.push(`/cycles/${cycleId.toString()}`);
  };

  if (userActiveInvestments.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-muted-foreground text-lg">
          You don't have any active investments yet.
        </p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {userActiveInvestments.map((investment) => {
        const cycle = mockInvestmentCycles.find(
          (c) => c.id === investment.cycleId
        );

        if (!cycle) return null;

        return (
          <CycleCard
            key={investment.id}
            title={cycle.name}
            status="active"
            details={[
              {
                label: 'My Investment',
                value: `₦${parseFloat(investment.amountInvested.toString()).toLocaleString('en-NG', {
                  minimumFractionDigits: 2,
                  maximumFractionDigits: 2,
                })}`,
              },
              { label: 'Shares Held', value: investment.shares.toString() },
              { label: 'Cycle End Date', value: 'Nov 30, 2025' },
            ]}
            buttonText="View Details"
            buttonVariant="outline"
            onButtonClick={() => handleViewDetails(cycle.id)}
          />
        );
      })}
    </div>
  );
}