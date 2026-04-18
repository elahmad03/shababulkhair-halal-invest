"use client";

import {
  flexRender,
  getCoreRowModel,
  useReactTable,
  getSortedRowModel,
  SortingState,
  getFilteredRowModel,
  ColumnFiltersState,
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
import { columns, type CycleWithStats } from "./Columns";
import { useListCyclesQuery } from "@/store/modules/cycle/cycleApi";

export function CyclesDataTable() {
  const [sorting, setSorting] = useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);

  const { data, isLoading, isError } = useListCyclesQuery({
    page: 1,
    limit: 10,
  });

  // 🔥 Safe transformation
  const cyclesWithStats = useMemo<CycleWithStats[]>(() => {
    const cycles = data?.data?.data;

    if (!cycles || !Array.isArray(cycles)) return [];

    return cycles.map((cycle) => ({
      id: cycle.id,

      // Match your columns
      name: cycle.cycleName,
      status: cycle.status,

      // 🧠 Safe BigInt conversion
      pricePerShare: BigInt(cycle.PricePerShareKobo ?? 0),

      // Placeholder until backend provides
      totalInvested: BigInt(0),
      investorCount: 0,

      // Dates
      startDate: cycle.startDate ?? null,
      endDate: cycle.endDate ?? null,
      createdAt: cycle.createdAt,
    }));
  }, [data]);

  const table = useReactTable({
    data: cyclesWithStats,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    state: {
      sorting,
      columnFilters,
    },
  });

  // ✅ Loading state
  if (isLoading) {
    return <div className="p-6 text-sm">Loading cycles...</div>;
  }

  // ✅ Error state
  if (isError) {
    return (
      <div className="p-6 text-sm text-red-500">
        Failed to load cycles. Try again.
      </div>
    );
  }

  return (
    <div className="w-full">
      {/* Search */}
      <div className="p-4 border-b">
        <Input
          placeholder="Search cycles..."
          value={(table.getColumn("name")?.getFilterValue() as string) ?? ""}
          onChange={(event) =>
            table.getColumn("name")?.setFilterValue(event.target.value)
          }
          className="max-w-sm"
        />
      </div>

      {/* Table */}
      <div className="min-w-full">
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
            {table.getRowModel().rows.length ? (
              table.getRowModel().rows.map((row) => (
                <TableRow key={row.id}>
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
              <TableRow>
                <TableCell
                  colSpan={columns.length}
                  className="h-24 text-center text-muted-foreground"
                >
                  No cycles found.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}