"use client";

import { useRouter } from "next/navigation";
import { CycleCard } from "./cycle-card";
import { useListCyclesQuery } from "@/store/hooks";
import { formatCurrency } from "@/lib/utils";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertCircle, Loader2 } from "lucide-react";

export function OpenCyclesTab() {
  const router = useRouter();
  const { data: response, isLoading, isError, error } = useListCyclesQuery({ page: 1, limit: 50 });

  const openCycles = response?.data?.data?.filter(
    (cycle) => cycle.status === "OPEN_FOR_INVESTMENT"
  ) ?? [];

  const formatDateRange = (start?: string | null, end?: string | null) => {
    if (!start || !end) return "-";
    try {
      const s = new Date(start);
      const e = new Date(end);
      if (isNaN(s.getTime()) || isNaN(e.getTime())) return "-";
      return `${s.toLocaleDateString("en-US", { month: "short", day: "numeric" })} - ${e.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}`;
    } catch {
      return "-";
    }
  };

  const calculateDuration = (start?: string | null, end?: string | null) => {
    if (!start || !end) return "-";
    try {
      const s = new Date(start);
      const e = new Date(end);
      if (isNaN(s.getTime()) || isNaN(e.getTime())) return "-";
      const diffTime = Math.abs(e.getTime() - s.getTime());
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      const weeks = Math.floor(diffDays / 7);
      const months = Math.floor(diffDays / 30);
      if (months > 0) return `${months} Month${months > 1 ? "s" : ""}`;
      if (weeks > 0) return `${weeks} Week${weeks > 1 ? "s" : ""}`;
      return `${diffDays} Day${diffDays > 1 ? "s" : ""}`;
    } catch {
      return "-";
    }
  };

  const handleInvestNow = (cycleId: string) => {
    router.push(`/user/invest/${cycleId}`);
  };

  // Loading state
  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center space-y-4">
          <Loader2 className="h-8 w-8 animate-spin mx-auto text-emerald-600" />
          <p className="text-muted-foreground">Loading investment cycles...</p>
        </div>
      </div>
    );
  }

  // Error state
  if (isError) {
    const errorMessage = 
      error && 'data' in error && typeof error.data === 'object' && error.data !== null && 'message' in error.data
        ? (error.data as { message: string }).message
        : "Failed to load cycles. Please try again.";
    
    return (
      <Alert variant="destructive" className="border-red-200 bg-red-50">
        <AlertCircle className="h-4 w-4 text-red-600" />
        <AlertDescription className="text-red-800">
          {errorMessage}
        </AlertDescription>
      </Alert>
    );
  }

  // Empty state
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
          title={cycle.cycleName}
          status="OPEN_FOR_INVESTMENT"
          details={[
            {
              label: "Investment Window",
              value: formatDateRange(cycle.startDate, cycle.endDate),
            },
            {
              label: "Cycle Duration",
              value: calculateDuration(cycle.startDate, cycle.endDate),
            },
            {
              label: "Share Price",
              value: formatCurrency(Number(cycle.pricePerShareKobo)),
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