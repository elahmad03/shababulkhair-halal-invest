"use client"

import { ColumnDef } from "@tanstack/react-table"
import { BusinessAllocation } from "@/lib/data/Businessdata"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { MoreHorizontal, Edit, Eye, CheckCircle } from "lucide-react"

const formatCurrency = (amount: number | null) => {
  if (amount === null) return "-"
  return new Intl.NumberFormat("en-NG", {
    style: "currency",
    currency: "NGN",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount)
}

export const columns: ColumnDef<BusinessAllocation>[] = [
  {
    accessorKey: "ventureName",
    header: "Venture Name",
    cell: ({ row }) => (
      <div className="min-w-[150px]">
        <div className="font-medium text-sm sm:text-base">
          {row.getValue("ventureName")}
        </div>
        <div className="text-xs text-muted-foreground sm:hidden mt-1">
          {row.original.managedBy}
        </div>
      </div>
    ),
  },
  {
    accessorKey: "managedBy",
    header: "Managed By",
    cell: ({ row }) => (
      <div className="text-sm hidden sm:table-cell">{row.getValue("managedBy")}</div>
    ),
  },
  {
    accessorKey: "investmentCycle",
    header: "Investment Cycle",
    cell: ({ row }) => (
      <div className="text-sm text-muted-foreground hidden lg:table-cell min-w-[140px]">
        {row.getValue("investmentCycle")}
      </div>
    ),
  },
  {
    accessorKey: "allocatedAmount",
    header: "Allocated",
    cell: ({ row }) => (
      <div className="min-w-[100px]">
        <div className="font-medium text-sm text-emerald-700">
          {formatCurrency(row.getValue("allocatedAmount"))}
        </div>
        <div className="text-xs text-muted-foreground lg:hidden mt-1">
          Profit: {formatCurrency(row.original.profitRealized)}
        </div>
      </div>
    ),
  },
  {
    accessorKey: "profitRealized",
    header: "Profit",
    cell: ({ row }) => (
      <div className="font-medium text-sm text-green-700 hidden lg:table-cell min-w-[100px]">
        {formatCurrency(row.getValue("profitRealized"))}
      </div>
    ),
  },
  {
    accessorKey: "status",
    header: "Status",
    cell: ({ row }) => {
      const status = row.getValue("status") as string
      return (
        <Badge
          variant={status === "Completed" ? "default" : "secondary"}
          className={
            status === "Completed"
              ? "bg-gradient-to-r from-emerald-500 to-green-500 text-white"
              : "bg-gray-100 text-gray-700"
          }
        >
          {status}
        </Badge>
      )
    },
  },
  {
    id: "actions",
    header: "",
    cell: ({ row }) => {
      const allocation = row.original

      return (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="h-8 w-8 p-0">
              <span className="sr-only">Open menu</span>
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-[200px]">
            <DropdownMenuLabel>Actions</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem className="cursor-pointer">
              <Edit className="mr-2 h-4 w-4" />
              Edit Allocation
            </DropdownMenuItem>
            <DropdownMenuItem className="cursor-pointer">
              <Eye className="mr-2 h-4 w-4" />
              View Details
            </DropdownMenuItem>
            {allocation.status === "Active" && (
              <>
                <DropdownMenuSeparator />
                <DropdownMenuItem className="cursor-pointer text-green-600">
                  <CheckCircle className="mr-2 h-4 w-4" />
                  Mark as Completed
                </DropdownMenuItem>
              </>
            )}
          </DropdownMenuContent>
        </DropdownMenu>
      )
    },
  },
]