"use client"

import { ColumnDef } from "@tanstack/react-table"
import type { BusinessVentureWithDetails } from "@/db/types"
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
import { formatCurrency } from "@/lib/utils"

export const columns: ColumnDef<BusinessVentureWithDetails>[] = [
  {
    accessorKey: "companyName",
    header: "Venture Name",
    cell: ({ row }) => (
      <div className="min-w-[150px]">
        <div className="font-medium text-sm sm:text-base">
          {row.getValue("companyName")}
        </div>
        <div className="text-xs text-muted-foreground sm:hidden mt-1">
          {row.original.managerName}
        </div>
      </div>
    ),
  },
  {
    accessorKey: "managerName",
    header: "Managed By",
    cell: ({ row }) => (
      <div className="text-sm hidden sm:table-cell">{row.getValue("managerName")}</div>
    ),
  },
  {
    accessorKey: "cycleName",
    header: "Investment Cycle",
    cell: ({ row }) => (
      <div className="text-sm text-muted-foreground hidden lg:table-cell min-w-[140px]">
        {row.getValue("cycleName")}
      </div>
    ),
  },
  {
    accessorKey: "allocatedAmount",
    header: "Allocated",
    cell: ({ row }) => {
      const amount = row.getValue("allocatedAmount") as bigint
      return (
        <div className="min-w-[100px]">
          <div className="font-medium text-sm text-emerald-700">
            {formatCurrency(amount)}
          </div>
          <div className="text-xs text-muted-foreground lg:hidden mt-1">
            Profit: {formatCurrency(row.original.profitRealized)}
          </div>
        </div>
      )
    },
  },
  {
    accessorKey: "expectedProfit",
    header: "Expected Profit",
    cell: ({ row }) => {
      const expprofit = row.getValue("expectedProfit") as bigint
      return (
        <div className="font-medium text-sm text-green-700 hidden lg:table-cell min-w-[100px]">
          {expprofit === 0n ? "-" : formatCurrency(expprofit)}
        </div>
      )
    },
  },
  
  {
    accessorKey: "profitRealized",
    header: "Profit",
    cell: ({ row }) => {
      const profit = row.getValue("profitRealized") as bigint
      return (
        <div className="font-medium text-sm text-green-700 hidden lg:table-cell min-w-[100px]">
          {profit === 0n ? "-" : formatCurrency(profit)}
        </div>
      )
    },
  },
  {
    accessorKey: "status",
    header: "Status",
    cell: ({ row }) => {
      const status = row.getValue("status") as string
      return (
        <Badge
          variant={status === "completed" ? "default" : "secondary"}
          className={
            status === "completed"
              ? "bg-gradient-to-r from-emerald-500 to-green-500 text-white"
              : "bg-gray-100 text-gray-700"
          }
        >
          {status === "completed" ? "Completed" : "Active"}
        </Badge>
      )
    },
  },
  {
    id: "actions",
    header: "",
    cell: ({ row }) => {
      const venture = row.original

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
            {venture.status === "active" && (
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