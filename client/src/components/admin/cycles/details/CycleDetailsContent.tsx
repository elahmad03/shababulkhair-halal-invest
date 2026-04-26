"use client";

import { notFound } from "next/navigation";
import { Badge } from "@/components/ui/badge";
import { getStatusColor } from "@/lib/utils/cycle";
import { CycleMetrics } from "@/components/admin/cycles/details/CycleMetrics";
import { CycleTabs } from "@/components/admin/cycles/details/CycleTabs";
import { mapCycleDetailsToUI } from "@/lib/adpater/cycleDetails.adapters";
// Adjust the import path below to point to the file containing your RTK slice
import { useGetCycleByIdQuery } from "@/store/modules/cycle/cycleApi"; 
import CycleDetailsLoading from "@/components/admin/cycles/details/CycleDetailsloading";

export default function CycleDetailsContent({
  cycleId,
}: {
  cycleId: string;
}) {
    
  const { data: response, isError, isLoading } = useGetCycleByIdQuery(cycleId);

  // Handle loading state directly since RTK Query useQuery doesn't trigger React Suspense boundaries by default
  if (isLoading) {
    return <CycleDetailsLoading />;
  }

  const rawCycle = response?.data;

  if (isError || !rawCycle) {
    notFound();
  }

  // Cast rawCycle to bypass the strict type mismatch (Fixes TS2345)
  const cycleDetails = mapCycleDetailsToUI(rawCycle as any);

  return (
    <>
      {/* Title + Status */}
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-semibold">
          "{cycleDetails.name}"
        </h2>

        <Badge
          className={`${getStatusColor(
            cycleDetails.status
          )} text-white text-lg px-4 py-2`}
        >
          {cycleDetails.status}
        </Badge>
      </div>

      {/* Metrics */}
      <CycleMetrics cycleData={cycleDetails} />

      {/* Tabs */}
      <CycleTabs cycleData={cycleDetails} />
    </>
  );
}