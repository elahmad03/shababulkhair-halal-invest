import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

import { getStatusColor } from "@/lib/utils/cycle";
import { CycleMetrics } from "@/components/admin/cycles/details/CycleMetrics";
import { CycleTabs } from "@/components/admin/cycles/details/CycleTabs";

import { getCycleDetailsApi } from "@/lib/api/cycle";
import { mapCycleDetailsToUI } from "@/lib/adpater/cycleDetails.adapters";

type Props = {
  params: { cycleId: string };
};

export default async function CycleDetailsPage({ params }: Props) {
  const { cycleId } = params;

  // ✅ fetch from backend
  const rawCycle = await getCycleDetailsApi(cycleId);

  if (!rawCycle) {
    notFound();
  }

  // ✅ normalize data
  const cycleDetails = mapCycleDetailsToUI(rawCycle);

  return (
    <div className="container mx-auto py-8 px-4 max-w-7xl">
      {/* Header */}
      <div className="mb-8">
        <Link href="/admin/cycles">
          <Button variant="ghost" className="mb-4">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Cycles
          </Button>
        </Link>

        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold">
            Cycle Details: "{cycleDetails.name}"
          </h1>

          <Badge
            className={`${getStatusColor(
              cycleDetails.status
            )} text-white text-lg px-4 py-2`}
          >
            {cycleDetails.status}
          </Badge>
        </div>
      </div>

      {/* Metrics */}
      <CycleMetrics cycleData={cycleDetails} />

      {/* Tabs */}
      <CycleTabs cycleData={cycleDetails} />
    </div>
  );
}