"use client";

import {
  flexRender,
  getCoreRowModel,
  useReactTable,
  getSortedRowModel,
  SortingState,
  getFilteredRowModel,
  ColumnFiltersState,
  getPaginationRowModel,
} from "@tanstack/react-table";
import { useState, useMemo } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { columns, type CycleWithStats } from "./Columns";
import { useListCyclesQuery } from "@/store/modules/cycle/cycleApi";
import { AlertCircle, Loader2, Search } from "lucide-react";

export function CyclesDataTable() {
  const [sorting, setSorting] = useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);

  // TODO: Once you implement server-side pagination, you can map standard React state to these params
  const { data, isLoading, isError } = useListCyclesQuery({
    page: 1,
    limit: 10,
  });

  // Safe transformation aligned with the new 4-stage timeline schema
  const cyclesWithStats = useMemo<CycleWithStats[]>(() => {
    const rawData = data?.data;
    const cycles = Array.isArray(rawData)
      ? rawData
      : (rawData?.cycles || rawData?.data || []);

    if (!cycles || !Array.isArray(cycles)) return [];

    return cycles.map((cycle: any) => ({
      id: cycle.id,
      name: cycle.cycleName,
      status: cycle.status,
      pricePerShare: BigInt(cycle.pricePerShareKobo ?? 0),
      totalInvested: BigInt(cycle.totalProfitRealizedKobo ?? 0),
      investorCount: cycle._count?.investments ?? 0,
      
      // Updated timeline fields
      fundingOpensAt: cycle.fundingOpensAt ?? null,
      fundingClosesAt: cycle.fundingClosesAt ?? null,
      activeStartsAt: cycle.activeStartsAt ?? null,
      activeEndsAt: cycle.activeEndsAt ?? null,
      
      createdAt: cycle.createdAt,
    }));
  }, [data]);

  const table = useReactTable({
    data: cyclesWithStats,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    state: {
      sorting,
      columnFilters,
    },
  });

  // Semantic Error State
  if (isError) {
    return (
      <div className="flex flex-col items-center justify-center p-8 text-center border rounded-lg bg-destructive/10 border-destructive/20 text-destructive">
        <AlertCircle className="w-8 h-8 mb-3" />
        <p className="text-sm font-medium">Failed to load investment cycles.</p>
        <p className="text-xs opacity-80">Please check your connection and try again.</p>
      </div>
    );
  }

  return (
    <div className="space-y-4 w-full">
      {/* Table Toolbar */}
      <div className="flex items-center justify-between">
        <div className="relative max-w-sm w-full border-muted-foreground/20">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search cycles..."
            value={(table.getColumn("name")?.getFilterValue() as string) ?? ""}
            onChange={(event) =>
              table.getColumn("name")?.setFilterValue(event.target.value)
            }
            className="pl-8 w-full"
          />
        </div>
      </div>

      {/* Main Data Table */}
      <div className="rounded-md border bg-card">
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => (
                  <TableHead key={header.id} className="whitespace-nowrap">
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
            {isLoading ? (
              // Semantic Loading State matching table structure
              <TableRow>
                <TableCell
                  colSpan={columns.length}
                  className="h-32 text-center text-muted-foreground"
                >
                  <div className="flex flex-col items-center justify-center">
                    <Loader2 className="h-6 w-6 animate-spin mb-2" />
                    <p className="text-sm">Loading cycles...</p>
                  </div>
                </TableCell>
              </TableRow>
            ) : table.getRowModel().rows?.length ? (
              table.getRowModel().rows.map((row) => (
                <TableRow
                  key={row.id}
                  data-state={row.getIsSelected() && "selected"}
                  className="transition-colors hover:bg-muted/50"
                >
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id} className="whitespace-nowrap">
                      {flexRender(
                        cell.column.columnDef.cell,
                        cell.getContext()
                      )}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              // Empty State
              <TableRow>
                <TableCell
                  colSpan={columns.length}
                  className="h-32 text-center text-muted-foreground"
                >
                  No investment cycles found.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      {/* Pagination Controls (Standard Shadcn Table Footer) */}
      <div className="flex items-center justify-end space-x-2 py-2">
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
  );
}