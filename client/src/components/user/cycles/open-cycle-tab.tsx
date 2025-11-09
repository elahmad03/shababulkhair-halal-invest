"use client";

import { useRouter } from "next/navigation";
import { CycleCard } from "./cycle-card";
import { mockInvestmentCycles } from "@/db";
import type { InvestmentCycle } from "@/db/types";
import { formatCurrency } from "@/lib/utils";

export function OpenCyclesTab() {
  const router = useRouter();
  
  const openCycles: InvestmentCycle[] = mockInvestmentCycles.filter(
    (cycle) => cycle.status === "open_for_investment"
  );

  const formatDateRange = (start?: Date | string | null, end?: Date | string | null) => {
  if (!start || !end) return "-";
  const s = start instanceof Date ? start : new Date(start);
  const e = end instanceof Date ? end : new Date(end);
  if (isNaN(s.getTime()) || isNaN(e.getTime())) return "-";
  return `${s.toLocaleDateString("en-US", { month: "short", day: "numeric" })} - ${e.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}`;
};

  const handleInvestNow = (cycleId: number) => {
    // Navigate to investment page or open a dialog
    router.push(`invest/${cycleId}`);
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
          status={"open_for_investment"}
          details={[
            {
              label: "Investment Window",
              value: formatDateRange(cycle.startDate, cycle.endDate),
            },
            { label: "Cycle Duration", value: "3 Month" },
            {
              label: "Share Price",
              value: formatCurrency(cycle.pricePerShare),
            },
          ]}
          buttonText="Invest Now"
          buttonVariant="default"
          onButtonClick={() => handleInvestNow(cycle.id)}
        />
      ))}
    </div>
  );
}