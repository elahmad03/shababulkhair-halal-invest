// app/(admin)/cycles/[id]/page.tsx
import Link from "next/link"
import { ArrowLeft } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { getCycleById } from "@/lib/data/cycle"
import { getStatusColor } from "@/lib/utils/cycle"
import { CycleMetrics } from "@/components/admin/cycles/CycleMetrics"
import { CycleTabs } from "@/components/admin/cycles/CycleTabs"

export default async function CycleDetailsPage({
  params,
}: {
  params: { id: string }
}) {
  const cycleData = await getCycleById(params.id)

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
            Cycle Details: "{cycleData.name}"
          </h1>
          <Badge
            className={`${getStatusColor(
              cycleData.status
            )} text-white text-lg px-4 py-2`}
          >
            {cycleData.status}
          </Badge>
        </div>
      </div>

      {/* Key Metrics */}
      <CycleMetrics cycleData={cycleData} />

      {/* Tabbed Interface */}
      <CycleTabs cycleData={cycleData} />
    </div>
  )
}