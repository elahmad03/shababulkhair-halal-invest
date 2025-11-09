import { Suspense } from "react";
import { CyclesDataTable } from "@/components/admin/cycles/CycleDataTable";
import { CreateCycleDialog } from "@/components/admin/cycles/CreateCycleDiaglog";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

export default function CycleManagementPage() {
  return (
    <div className="container mx-auto py-6 space-y-6">
      {/* Header Section */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Cycle Management</h1>
          <p className="text-muted-foreground mt-1">
            Create and manage investment cycles
          </p>
        </div>
        <CreateCycleDialog />
      </div>

      {/* Data Table Card */}
      <Card>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <Suspense fallback={<TableSkeleton />}>
              <CyclesDataTable />
            </Suspense>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

function TableSkeleton() {
  return (
    <div className="p-6 space-y-4">
      <Skeleton className="h-10 w-full" />
      <Skeleton className="h-10 w-full" />
      <Skeleton className="h-10 w-full" />
      <Skeleton className="h-10 w-full" />
    </div>
  );
}