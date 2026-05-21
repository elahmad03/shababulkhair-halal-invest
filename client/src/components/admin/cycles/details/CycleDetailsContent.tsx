"use client";

import { notFound } from "next/navigation";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertCircle } from "lucide-react";
import { CycleMetrics } from "@/components/admin/cycles/details/CycleMetrics";
import { CycleTabs } from "@/components/admin/cycles/details/CycleTabs";
import { mapCycleDetailsToUI } from "@/lib/adpater/cycleDetails.adapters";
import { useGetCycleByIdQuery } from "@/store/hooks";
import CycleDetailsLoading from "@/components/admin/cycles/details/CycleDetailsloading";

export default function CycleDetailsContent({
  cycleId,
}: {
  cycleId: string;
}) {
  const { data: response, isError, isLoading, error } = useGetCycleByIdQuery(cycleId);

  // Handle loading state
  if (isLoading) {
    return <CycleDetailsLoading />;
  }

  // Handle error state
  if (isError) {
    const errorMessage = 
      error && 'data' in error && typeof error.data === 'object' && error.data !== null && 'message' in error.data
        ? (error.data as { message: string }).message
        : "Failed to load cycle details. Please try again.";
    
    return (
      <Alert variant="destructive" className="border-red-200 bg-red-50">
        <AlertCircle className="h-4 w-4 text-red-600" />
        <AlertDescription className="text-red-800">
          {errorMessage}
        </AlertDescription>
      </Alert>
    );
  }

  const rawCycle = response?.data;

  if (!rawCycle) {
    notFound();
  }

  // Transform server data to UI format
  const cycleDetails = mapCycleDetailsToUI(rawCycle as any);

  return (
    <>
      {/* Title + Status */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h2 className="text-3xl font-bold text-slate-900">
            {cycleDetails.name}
          </h2>
          <p className="text-sm text-slate-600 mt-1">
            Cycle ID: {cycleDetails.id}
          </p>
        </div>

        <StatusBadge status={cycleDetails.status} />
      </div>

      {/* Metrics */}
      <CycleMetrics cycleData={cycleDetails} />

      {/* Tabs */}
      <CycleTabs cycleData={cycleDetails} />
    </>
  );
}

// Semantic status badge component
function StatusBadge({ status }: { status: string }) {
  const statusStyles: Record<string, { bg: string; text: string; border: string; icon?: string }> = {
    pending: {
      bg: "bg-slate-50",
      text: "text-slate-700",
      border: "border-slate-200",
      icon: "⏳",
    },
    open_for_investment: {
      bg: "bg-emerald-50",
      text: "text-emerald-700",
      border: "border-emerald-200",
      icon: "💰",
    },
    active: {
      bg: "bg-blue-50",
      text: "text-blue-700",
      border: "border-blue-200",
      icon: "⚡",
    },
    completed: {
      bg: "bg-green-50",
      text: "text-green-700",
      border: "border-green-200",
      icon: "✓",
    },
  };

  const style = statusStyles[status] || statusStyles.pending;

  return (
    <Badge
      className={`${style.bg} ${style.text} border ${style.border} px-4 py-2 text-base font-semibold shadow-sm`}
    >
      <span className="mr-2">{style.icon}</span>
      {status.replace(/_/g, " ").charAt(0).toUpperCase() + status.slice(1).replace(/_/g, " ")}
    </Badge>
  );
}