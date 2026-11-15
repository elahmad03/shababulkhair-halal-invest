"use client";

import { notFound } from "next/navigation";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertCircle } from "lucide-react";
import { CycleMetrics } from "@/components/admin/cycles/details/CycleMetrics";
import { CycleTabs } from "@/components/admin/cycles/details/CycleTabs";
import { CycleStatusBadge } from "@/components/admin/cycles/CyclestatusBadge";
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
      error &&
      typeof error === "object" &&
      "data" in error &&
      typeof error.data === "object" &&
      error.data !== null &&
      "message" in error.data
        ? (error.data as { message: string }).message
        : "Failed to load cycle details. Please try again.";

    return (
      <Alert variant="destructive">
        <AlertCircle className="h-4 w-4" />
        <AlertDescription>{errorMessage}</AlertDescription>
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
          <h2 className="text-3xl font-bold text-foreground">
            {cycleDetails.name}
          </h2>
        </div>

        <CycleStatusBadge status={cycleDetails.rawStatus || cycleDetails.status} />
      </div>

      {/* Metrics */}
      <CycleMetrics cycleData={cycleDetails} />

      {/* Tabs */}
      <CycleTabs cycleData={cycleDetails} />
    </>
  );
}
