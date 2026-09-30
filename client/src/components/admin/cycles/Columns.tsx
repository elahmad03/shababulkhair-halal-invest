"use client";

import { ColumnDef } from "@tanstack/react-table";
import { format } from "date-fns";
import { CycleStatusBadge } from "./CyclestatusBadge";
import { CycleActionsDropdown } from "./CycleActionMenu";
import { formatCurrency } from "@/lib/utils";

export type CycleWithStats = {
  id: string;
  name: string;
  status: string;
  pricePerShare: bigint;
  totalInvested: bigint;
  investorCount: number;
  fundingOpensAt: string | null;
  fundingClosesAt: string | null;
  activeStartsAt: string | null;
  activeEndsAt: string | null;
  createdAt: string;
};

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
    id: "activeWindow",
    header: "Active Window",
    cell: ({ row }) => {
      // Replaced old startDate/endDate with the new active timeline fields
      const start = row.original.activeStartsAt;
      const end = row.original.activeEndsAt;

      if (!start || !end) {
        return <span className="text-muted-foreground text-sm">Not set</span>;
      }

      return (
        <div className="text-sm whitespace-nowrap">
          {format(new Date(start), "MMM d")} -{" "}
          {format(new Date(end), "MMM d, yyyy")}
        </div>
      );
    },
  },
  {
    id: "actions",
    cell: ({ row }) => <CycleActionsDropdown cycle={row.original} />,
  },
];