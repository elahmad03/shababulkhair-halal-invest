// components/admin/cycles/cycles-data-table.tsx
"use client";

import { useState } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Search } from "lucide-react";
import { CycleStatusBadge } from "./CyclestatusBadge";
import { CycleActionsMenu } from "./CycleActionMenu";

// Mock data - replace with actual data fetching
const mockCycles = [
  {
    id: "1",
    name: "November 2025 Cycle",
    status: "open" as const,
    totalInvested: 15000000,
    investors: 42,
    startDate: "2025-11-01",
    endDate: "2025-11-30",
  },
  {
    id: "2",
    name: "October 2025 Cycle",
    status: "active" as const,
    totalInvested: 28500000,
    investors: 67,
    startDate: "2025-10-01",
    endDate: "2025-10-31",
  },
  {
    id: "3",
    name: "September 2025 Cycle",
    status: "completed" as const,
    totalInvested: 32000000,
    investors: 58,
    startDate: "2025-09-01",
    endDate: "2025-09-30",
  },
  {
    id: "4",
    name: "December 2025 Cycle",
    status: "pending" as const,
    totalInvested: 0,
    investors: 0,
    startDate: "2025-12-01",
    endDate: "2025-12-31",
  },
];

export function CyclesDataTable() {
  const [searchQuery, setSearchQuery] = useState("");

  const filteredCycles = mockCycles.filter((cycle) =>
    cycle.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-NG", {
      style: "currency",
      currency: "NGN",
      minimumFractionDigits: 0,
    }).format(amount);
  };

  const formatDateRange = (start: string, end: string) => {
    const startDate = new Date(start);
    const endDate = new Date(end);
    return `${startDate.toLocaleDateString("en-US", { month: "short", day: "numeric" })} - ${endDate.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}`;
  };

  return (
    <div className="space-y-4">
      {/* Search Bar */}
      <div className="flex items-center justify-between">
        <div className="relative w-96">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
          <Input
            placeholder="Search cycles by name..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>
      </div>

      {/* Table */}
      <div className="rounded-lg border border-slate-200 bg-white shadow-sm overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow className="bg-slate-50 hover:bg-slate-50">
              <TableHead className="font-semibold text-slate-900">Cycle Name</TableHead>
              <TableHead className="font-semibold text-slate-900">Status</TableHead>
              <TableHead className="font-semibold text-slate-900">Total Invested</TableHead>
              <TableHead className="font-semibold text-slate-900">Investors</TableHead>
              <TableHead className="font-semibold text-slate-900">Date Range</TableHead>
              <TableHead className="font-semibold text-slate-900 text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredCycles.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center py-12 text-slate-500">
                  No cycles found matching your search.
                </TableCell>
              </TableRow>
            ) : (
              filteredCycles.map((cycle) => (
                <TableRow key={cycle.id} className="hover:bg-slate-50">
                  <TableCell className="font-medium text-slate-900">
                    {cycle.name}
                  </TableCell>
                  <TableCell>
                    <CycleStatusBadge status={cycle.status} />
                  </TableCell>
                  <TableCell className="font-semibold text-slate-900">
                    {formatCurrency(cycle.totalInvested)}
                  </TableCell>
                  <TableCell className="text-slate-700">
                    {cycle.investors}
                  </TableCell>
                  <TableCell className="text-slate-700">
                    {formatDateRange(cycle.startDate, cycle.endDate)}
                  </TableCell>
                  <TableCell className="text-right">
                    <CycleActionsMenu cycle={cycle} />
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}