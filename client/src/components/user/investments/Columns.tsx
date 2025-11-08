"use client"

import { ColumnDef } from "@tanstack/react-table"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { ArrowUpDown, ExternalLink } from "lucide-react"
import { formatCurrency } from "@/lib/utils"
import { format } from "date-fns"
import Link from "next/link"

export interface InvestmentTableRow {
  id: number
  cycleName: string
  cycleStatus: string
  investedAt: Date
  shares: number
  amountInvested: bigint
  profitEarned: bigint
}

export const columns: ColumnDef<InvestmentTableRow>[] = [
  {
    accessorKey: "cycleName",
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          className="hover:bg-transparent p-0"
        >
          Cycle Name
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      )
    },
    cell: ({ row }) => (
      <div className="font-medium">{row.getValue("cycleName")}</div>
    ),
  },
  {
    accessorKey: "investedAt",
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          className="hover:bg-transparent p-0"
        >
          Date Invested
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      )
    },
    cell: ({ row }) => {
      const date = row.getValue("investedAt") as Date
      return <div className="text-sm">{format(date, "MMM dd, yyyy")}</div>
    },
  },
  {
    accessorKey: "cycleStatus",
    header: "Status",
    cell: ({ row }) => {
      const status = row.getValue("cycleStatus") as string
      const getStatusConfig = (status: string) => {
        switch (status) {
          case "active":
            return { label: "Active", color: "bg-blue-500" }
          case "completed":
            return { label: "Completed", color: "bg-green-500" }
          default:
            return { label: "Pending", color: "bg-gray-400" }
        }
      }
      const config = getStatusConfig(status)
      return (
        <Badge className={`${config.color} text-white`}>{config.label}</Badge>
      )
    },
  },
  {
    accessorKey: "shares",
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          className="hover:bg-transparent p-0"
        >
          Shares
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      )
    },
    cell: ({ row }) => <div className="font-medium">{row.getValue("shares")}</div>,
  },
  {
    accessorKey: "amountInvested",
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          className="hover:bg-transparent p-0"
        >
          Amount Invested
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      )
    },
    cell: ({ row }) => {
      const amount = row.getValue("amountInvested") as bigint
      return (
        <div className="font-medium text-emerald-700 dark:text-emerald-400">
          {formatCurrency(amount)}
        </div>
      )
    },
  },
  {
    accessorKey: "profitEarned",
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          className="hover:bg-transparent p-0"
        >
          Profit Earned
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      )
    },
    cell: ({ row }) => {
      const profit = row.getValue("profitEarned") as bigint
      return profit > 0n ? (
        <div className="font-bold text-green-600 dark:text-green-400">
          +{formatCurrency(profit)}
        </div>
      ) : (
        <div className="text-muted-foreground">-</div>
      )
    },
  },
  {
    id: "actions",
    header: "",
    cell: ({ row }) => {
      return (
        <Link href={`/user/investments/${row.original.id}`}>
          <Button variant="ghost" size="sm">
            <ExternalLink className="h-4 w-4" />
          </Button>
        </Link>
      )
    },
  },
]