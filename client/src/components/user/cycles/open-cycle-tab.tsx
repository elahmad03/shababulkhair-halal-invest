'use client';

import { useState } from 'react';
import { mockData } from '@/lib/data/mockData'; // Adjust path as needed
import { CycleCard } from './cycle-card';
import { useRouter } from 'next/navigation';

export function OpenCyclesTab() {
  const router = useRouter();
  
  const openCycles = mockData.investmentCycles.filter(
    (cycle) => cycle.status === 'open_for_investment'
  );

  const handleInvestNow = (cycleId: number) => {
    // Navigate to investment page or open a dialog
    router.push(`/invest/${cycleId}`);
  };

  if (openCycles.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-muted-foreground text-lg">
          No investment cycles are open right now. Please check back soon.
        </p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {openCycles.map((cycle) => (
        <CycleCard
          key={cycle.id}
          title={cycle.name}
          status="open_for_investment"
          details={[
            { label: 'Investment Window', value: 'Oct 1 - Oct 15, 2025' },
            { label: 'Cycle Duration', value: '3 Months' },
            { label: 'Share Price', value: '₦10000' },
          ]}
          buttonText="Invest Now"
          buttonVariant="default"
          onButtonClick={() => handleInvestNow(cycle.id)}
        />
      ))}
    </div>
  );
}