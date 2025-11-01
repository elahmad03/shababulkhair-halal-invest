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

// --- CHANGE 1: Import the actual mockData from your db file ---
import { mockData } from "@/db";
import { formatCurrency } from "@/lib/utils";
// The InvestmentCycle type from your db/types is used implicitly, no need to import it here.

export function CyclesDataTable() {
  const [searchQuery, setSearchQuery] = useState("");

  // --- CHANGE 2: Process the real mock data to calculate derived values ---
  // This logic creates a new array that matches the structure your table expects.
  const processedCycles = mockData.investmentCycles.map((cycle) => {
    // Find all investments that belong to the current cycle
    const investmentsForCycle = mockData.shareholderInvestments.filter(
      (investment) => investment.cycleId === cycle.id
    );

    // Calculate the total amount invested by summing up amounts from related investments.
    // We start with 0n because the amounts are BigInts.
    const totalInvested = investmentsForCycle.reduce(
      (sum, investment) => sum + investment.amountInvested,
      0n
    );

    // Count the number of unique investors using a Set to avoid duplicates.
    const uniqueInvestorIds = new Set(
      investmentsForCycle.map((investment) => investment.userId)
    );
    const investorsCount = uniqueInvestorIds.size;

    // Return a new object that includes the original cycle data plus our calculated fields.
    return {
      ...cycle,
      totalInvested: Number(totalInvested), // Convert the BigInt to a number for the formatCurrency function
      investors: investorsCount,
    };
  });
  // --- END OF CHANGES ---

  // The search filter now works on the newly processed data
  const filteredCycles = processedCycles.filter((cycle) =>
    cycle.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const formatDateRange = (start: string, end: string) => {
    const startDate = new Date(start);
    const endDate = new Date(end);
    return `${startDate.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
    })} - ${endDate.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    })}`;
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
              <TableHead className="font-semibold text-slate-900">
                Cycle Name
              </TableHead>
              <TableHead className="font-semibold text-slate-900">
                Status
              </TableHead>
              <TableHead className="font-semibold text-slate-900">
                Total Invested
              </TableHead>
              <TableHead className="font-semibold text-slate-900">
                Investors
              </TableHead>
              <TableHead className="font-semibold text-slate-900">
                Date Range
              </TableHead>
              <TableHead className="font-semibold text-slate-900 text-right">
                Actions
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredCycles.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={6}
                  className="text-center py-12 text-slate-500"
                >
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
