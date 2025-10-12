"use client";

import { ColumnDef } from "@tanstack/react-table";
import { WithdrawalRequest } from "@/schemas/app";
import { Badge } from "@/components/ui/badge";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

// Helper to format the withdrawal type text
const formatType = (type: string) => {
  return type
    .split("_")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
};

// Helper to get badge color based on status
const getStatusVariant = (status: WithdrawalRequest["status"]): "default" | "destructive" | "outline" | "secondary" => {
    switch (status) {
        case "pending":
            return "secondary"; // Often yellow in themes
        case "approved":
            return "default"; // Often blue/primary in themes
        case "processed":
            return "outline"; // We can style this to be green
        case "rejected":
            return "destructive"; // Red
        default:
            return "secondary";
    }
}

export const columns: ColumnDef<WithdrawalRequest>[] = [
  {
    accessorKey: "requestedAt",
    header: "Date",
    cell: ({ row }) => {
      const date = new Date(row.getValue("requestedAt"));
      return <div>{date.toLocaleDateString("en-GB")}</div>;
    },
  },
  {
    accessorKey: "amount",
    header: () => <div className="text-right">Amount</div>,
    cell: ({ row }) => {
      const amount = parseFloat(row.getValue("amount"));
      const formatted = new Intl.NumberFormat("en-NG", {
        style: "currency",
        currency: "NGN",
      }).format(amount);

      return <div className="text-right font-medium">{formatted}</div>;
    },
  },
  {
    accessorKey: "withdrawalType",
    header: "Type",
    cell: ({ row }) => {
      return (
        <Badge variant="outline">
          {formatType(row.getValue("withdrawalType"))}
        </Badge>
      );
    },
  },
  {
    accessorKey: "status",
    header: "Status",
    cell: ({ row }) => {
      const status = row.original.status;
      const reason = row.original.rejectionReason;

      const StatusBadge = (
        <Badge variant={getStatusVariant(status)} className="capitalize">
            {/* Custom styling for better color representation */}
            {status === 'pending' && <span className="text-yellow-800 bg-yellow-100 px-2 py-0.5 rounded-full">{status}</span>}
            {status === 'approved' && <span className="text-blue-800 bg-blue-100 px-2 py-0.5 rounded-full">{status}</span>}
            {status === 'processed' && <span className="text-green-800 bg-green-100 px-2 py-0.5 rounded-full">{status}</span>}
            {status === 'rejected' && <span className="text-red-800 bg-red-100 px-2 py-0.5 rounded-full">{status}</span>}
        </Badge>
      );

      if (status === "rejected" && reason) {
        return (
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <div className="cursor-pointer">{StatusBadge}</div>
              </TooltipTrigger>
              <TooltipContent>
                <p>
                  <strong>Admin Note:</strong> {reason}
                </p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        );
      }

      return StatusBadge;
    },
  },
];