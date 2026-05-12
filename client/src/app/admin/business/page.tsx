"use client"

import { useMemo, useState } from "react"
import HeaderBox from "@/components/common/HeaderBox"
import BusinessStatsCards from "@/components/admin/business/businessStats"
import AddAllocationModal from "@/components/admin/business/AddAllocationModal"
import { BusinessAllocationsTable } from "@/components/admin/business/BusinessAllocationTable"
import { columns } from "@/components/admin/business/Columns"
import { Card, CardContent } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import { useListCyclesQuery } from "@/store/modules/cycle/cycleApi"
import { useGetVenturesByCycleQuery } from "@/store/modules/venture/ventureApi"
import { AlertCircle, TrendingUp } from "lucide-react"
import { formatCurrency } from "@/lib/utils"
import type { Cycle } from "@/store/modules/cycle/cycle.types"
import type { Venture } from "@/store/modules/venture/venture.types"

const BusinessManagementPage = () => {
  const [selectedCycleId, setSelectedCycleId] = useState<string | null>(null)
  const { data: cyclesData, isLoading: cyclesLoading } = useListCyclesQuery({})
  
  // Get first ACTIVE cycle by default
  const activeCycles = useMemo(() => {
    return (cyclesData?.data?.data || []).filter((c: Cycle) => c.status === "ACTIVE")
  }, [cyclesData])

  // Auto-select first active cycle
  const cycleId = selectedCycleId || activeCycles[0]?.id || null
  const { data: venturesData, isLoading: venturesLoading, error: venturesError } = useGetVenturesByCycleQuery(
    cycleId || "",
    { skip: !cycleId }
  )

  const ventures = venturesData?.data?.ventures || []
  
  // Extract committee members from ventures (managed by)
  const committeeMembers = useMemo(() => {
    const seen = new Set<string>()
    return ventures
      .map((v) => v.managedBy)
      .filter((m) => {
        if (seen.has(m.id)) return false
        seen.add(m.id)
        return true
      })
  }, [ventures])

  // Calculate statistics
  const stats = useMemo(() => {
    return {
      totalCapital: ventures.reduce((sum, v) => sum + Number(v.allocatedAmountKobo), 0),
      totalProfit: ventures.reduce((sum, v) => sum + Number(v.profitRealizedKobo), 0),
      expectedProfit: ventures.reduce((sum, v) => sum + Number(v.expectedProfitKobo), 0),
      ventureCount: ventures.length,
    }
  }, [ventures])

  const isLoading = cyclesLoading || venturesLoading

  return (
    <div className="flex flex-col gap-6 p-4 sm:p-6 lg:p-8 max-w-[1600px] mx-auto">
      {/* Header Section */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <HeaderBox
          title="Business Venture Management"
          subtext="Track capital allocations and investment returns across all cycles"
        />
        <div className="w-full sm:w-auto">
          <AddAllocationModal 
            committeeMembers={committeeMembers}
            onSuccess={() => {
              // Refetch will happen automatically via cache invalidation
            }}
          />
        </div>
      </div>

      {/* Stats Cards */}
      {isLoading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <Skeleton key={i} className="h-24 rounded-lg" />
          ))}
        </div>
      ) : (
        <BusinessStatsCards
          totalCapital={stats.totalCapital}
          totalProfit={stats.totalProfit}
          expectedProfit={stats.expectedProfit}
          ventureCount={stats.ventureCount}
        />
      )}

      {/* Ventures Table */}
      <Card>
        <CardContent className="p-0">
          {isLoading ? (
            <div className="space-y-3 p-6">
              {[1, 2, 3].map((i) => (
                <Skeleton key={i} className="h-12 w-full" />
              ))}
            </div>
          ) : venturesError ? (
            <div className="flex flex-col items-center justify-center gap-3 p-12 text-center">
              <div className="bg-destructive/10 p-3 rounded-full">
                <AlertCircle className="h-6 w-6 text-destructive" />
              </div>
              <div>
                <p className="font-semibold text-destructive">Failed to load ventures</p>
                <p className="text-sm text-muted-foreground">Please try again or contact support</p>
              </div>
            </div>
          ) : ventures.length === 0 ? (
            <div className="flex flex-col items-center justify-center gap-3 p-12 text-center">
              <div className="bg-primary/10 p-3 rounded-full">
                <TrendingUp className="h-6 w-6 text-primary" />
              </div>
              <div>
                <p className="font-semibold">No ventures yet</p>
                <p className="text-sm text-muted-foreground">
                  Create a new venture to get started
                </p>
              </div>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <BusinessAllocationsTable columns={columns} data={ventures} />
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}

export default BusinessManagementPage