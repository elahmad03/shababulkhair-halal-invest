"use client"

import { ColumnDef } from "@tanstack/react-table"
import type { Venture, VentureStatus } from "@/store/modules/venture/venture.types"
import { Badge } from "@/components/ui/badge"
import { formatCurrency } from "@/lib/utils"

export const columns: ColumnDef<Venture>[] = [
  {
    accessorKey: "companyName",
    header: "Venture Name",
    cell: ({ row }) => (
      <div className="min-w-[150px]">
        <div className="font-medium text-sm sm:text-base">
          {row.getValue("companyName")}
        </div>
        <div className="text-xs text-muted-foreground sm:hidden mt-1">
          {row.original.managedBy.firstName} {row.original.managedBy.lastName}
        </div>
      </div>
    ),
  },
  {
    accessorKey: "managedBy",
    header: "Managed By",
    cell: ({ row }) => {
      const manager = row.original.managedBy
      return (
        <div className="text-sm hidden sm:table-cell min-w-[140px]">
          {manager.firstName} {manager.lastName}
        </div>
      )
    },
  },
  {
    accessorKey: "cycle",
    header: "Investment Cycle",
    cell: ({ row }) => {
      const cycle = row.original.cycle
      return (
        <div className="text-sm text-muted-foreground hidden lg:table-cell min-w-[140px]">
          {cycle.cycleName}
        </div>
      )
    },
  },
  {
    accessorKey: "allocatedAmountKobo",
    header: "Allocated",
    cell: ({ row }) => {
      const amount = Number(row.getValue("allocatedAmountKobo"))
      return (
        <div className="min-w-[100px]">
          <div className="font-medium text-sm text-primary">
            {formatCurrency(amount)}
          </div>
          <div className="text-xs text-muted-foreground lg:hidden mt-1">
            Realized: {formatCurrency(Number(row.original.profitRealizedKobo))}
          </div>
        </div>
      )
    },
  },
  {
    accessorKey: "expectedProfitKobo",
    header: "Expected Profit",
    cell: ({ row }) => {
      const profit = Number(row.getValue("expectedProfitKobo"))
      return (
        <div className="font-medium text-sm text-primary hidden lg:table-cell min-w-[100px]">
          {profit === 0 ? "-" : formatCurrency(profit)}
        </div>
      )
    },
  },
  {
    accessorKey: "profitRealizedKobo",
    header: "Realized Profit",
    cell: ({ row }) => {
      const profit = Number(row.getValue("profitRealizedKobo"))
      return (
        <div className="font-medium text-sm text-primary hidden lg:table-cell min-w-[100px]">
          {profit === 0 ? "-" : formatCurrency(profit)}
        </div>
      )
    },
  },
  {
    accessorKey: "status",
    header: "Status",
    cell: ({ row }) => {
      const status = row.getValue("status") as VentureStatus
      const statusConfig: Record<VentureStatus, { label: string; variant: "default" | "secondary" | "destructive" | "outline" }> = {
        FUNDED: { label: "Funded", variant: "secondary" },
        OPERATING: { label: "Operating", variant: "default" },
        LIQUIDATED: { label: "Liquidated", variant: "outline" },
      }
      const config = statusConfig[status] || { label: status, variant: "secondary" as const }
      return (
        <Badge variant={config.variant}>
          {config.label}
        </Badge>
      )
    },
  },
]