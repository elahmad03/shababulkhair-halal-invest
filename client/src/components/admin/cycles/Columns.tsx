"use client";

import { ColumnDef } from "@tanstack/react-table";
import { format } from "date-fns";
import { CycleStatusBadge } from "./CyclestatusBadge";
import { CycleActionsDropdown } from "./CycleActionMenu";
import { formatCurrency } from "@/lib/utils";
import type { InvestmentCycle } from "@/db/types";

export interface CycleWithStats extends InvestmentCycle {
  totalInvested: bigint;
  investorCount: number;
}

export const columns: ColumnDef<CycleWithStats>[] = [
  {
    accessorKey: "name",
    header: "Cycle Name",
    cell: ({ row }) => (
      <div className="font-medium">{row.getValue("name")}</div>
    ),
  },
  {
    accessorKey: "status",
    header: "Status",
    cell: ({ row }) => (
      <CycleStatusBadge status={row.getValue("status")} />
    ),
  },
  {
    accessorKey: "totalInvested",
    header: "Total Invested",
    cell: ({ row }) => (
      <div className="font-medium">
        {formatCurrency(row.getValue("totalInvested"))}
      </div>
    ),
  },
  {
    accessorKey: "investorCount",
    header: "Investors",
    cell: ({ row }) => (
      <div className="text-center">{row.getValue("investorCount")}</div>
    ),
  },
  {
    id: "dateRange",
    header: "Date Range",
    cell: ({ row }) => {
      const startDate = row.original.startDate;
      const endDate = row.original.endDate;

      if (!startDate || !endDate) {
        return <span className="text-muted-foreground">Not set</span>;
      }

      return (
        <div className="text-sm">
          {format(new Date(startDate), "MMM d")} -{" "}
          {format(new Date(endDate), "MMM d, yyyy")}
        </div>
      );
    },
  },
  {
    id: "actions",
    cell: ({ row }) => <CycleActionsDropdown cycle={row.original} />,
  },
];