// components/admin/investors-table.tsx
"use client"

import * as React from "react"
import {
  ColumnDef,
  ColumnFiltersState,
  SortingState,
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
} from "@tanstack/react-table"
import { Input } from "@/components/ui/input"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { Investor } from "@/lib/types/cycle"

const columns: ColumnDef<Investor>[] = [
  {
    accessorKey: "memberName",
    header: "Member Name",
  },
  {
    accessorKey: "shares",
    header: "Shares",
  },
  {
    accessorKey: "amountInvested",
    header: "Amount Invested",
    cell: ({ row }) => `₦${row.original.amountInvested.toLocaleString()}`,
  },
  {
    accessorKey: "sharePercentage",
    header: "Share %",
    cell: ({ row }) => `${row.original.sharePercentage.toFixed(2)}%`,
  },
  {
    accessorKey: "profitEarned",
    header: "Profit Earned",
    cell: ({ row }) =>
      row.original.profitEarned
        ? `₦${row.original.profitEarned.toLocaleString()}`
        : "N/A",
  },
  {
    accessorKey: "amountWithProfit",
    header: "Amount with Profit",
    cell: ({ row }) =>
      row.original.amountWithProfit
        ? `₦${row.original.amountWithProfit.toLocaleString()}`
        : "N/A",
  },
]

interface InvestorsTableProps {
  data: Investor[]
}

export function InvestorsTable({ data }: InvestorsTableProps) {
  const [sorting, setSorting] = React.useState<SortingState>([])
  const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>(
    []
  )

  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    onSortingChange: setSorting,
    getSortedRowModel: getSortedRowModel(),
    onColumnFiltersChange: setColumnFilters,
    getFilteredRowModel: getFilteredRowModel(),
    state: {
      sorting,
      columnFilters,
    },
  })

  return (
    <div className="space-y-4">
      <Input
        placeholder="Search by member name..."
        value={
          (table.getColumn("memberName")?.getFilterValue() as string) ?? ""
        }
        onChange={(event) =>
          table.getColumn("memberName")?.setFilterValue(event.target.value)
        }
        className="max-w-sm"
      />
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => (
                  <TableHead key={header.id}>
                    {header.isPlaceholder
                      ? null
                      : flexRender(
                          header.column.columnDef.header,
                          header.getContext()
                        )}
                  </TableHead>
                ))}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {table.getRowModel().rows?.length ? (
              table.getRowModel().rows.map((row) => (
                <TableRow key={row.id}>
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id}>
                      {flexRender(
                        cell.column.columnDef.cell,
                        cell.getContext()
                      )}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell
                  colSpan={columns.length}
                  className="h-24 text-center"
                >
                  No results.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
      <div className="flex items-center justify-end space-x-2">
        <Button
          variant="outline"
          size="sm"
          onClick={() => table.previousPage()}
          disabled={!table.getCanPreviousPage()}
        >
          Previous
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={() => table.nextPage()}
          disabled={!table.getCanNextPage()}
        >
          Next
        </Button>
      </div>
    </div>
  )
}