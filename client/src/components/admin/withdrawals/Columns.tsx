"use client"

import { ColumnDef } from "@tanstack/react-table";
import { PendingWithdrawal } from "@/app/admin/withdrawals/page";
import { AdminWithdrawalActions } from "./WithdrawalsActions";
import { Badge } from "@/components/ui/badge";

const formatType = (type: string) => {
    return type.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase());
};

export const getColumns = ({ onAction }: { onAction: (requestId: number) => void }): ColumnDef<PendingWithdrawal>[] => [
    {
        accessorKey: "user.fullName",
        header: "User",
    },
    {
        accessorKey: "amount",
        header: () => <div className="text-right">Amount</div>,
        cell: ({ row }) => {
            const amount = parseFloat(row.getValue("amount"));
            const formatted = new Intl.NumberFormat("en-NG", {
                style: "currency", currency: "NGN"
            }).format(amount);
            return <div className="text-right font-medium">{formatted}</div>;
        },
    },
    {
        accessorKey: "requestedAt",
        header: "Date Requested",
        cell: ({ row }) => (
            <div>{new Date(row.getValue("requestedAt")).toLocaleDateString("en-GB")}</div>
        ),
    },
    {
        accessorKey: "withdrawalType",
        header: "Type",
        cell: ({ row }) => <Badge variant="secondary">{formatType(row.getValue("withdrawalType"))}</Badge>
    },
    {
        id: "actions",
        header: () => <div className="text-center">Actions</div>,
        cell: ({ row }) => {
            const { id } = row.original;
            return <AdminWithdrawalActions requestId={id} onAction={onAction} />;
        },
    },
];