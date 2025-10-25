"use client";

import { ColumnDef } from "@tanstack/react-table";
import { UserTableType } from "@/lib/types/dashboard";
import { Badge } from "@/components/ui/badge";
import { formatCurrency } from "@/lib/utils";
import { MoreHorizontal } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import Link from "next/link";

const roleVariantMap: Record<UserTableType['role'], "default" | "destructive" | "secondary"> = {
  admin: "destructive",
  committee: "default",
  member: "secondary",
};

const kycVariantMap: Record<UserTableType['kycStatus'], "default" | "destructive" | "secondary"> = {
  verified: "default",
  pending: "secondary",
  failed: "destructive",
};


export const columns: ColumnDef<UserTableType>[] = [
  {
    accessorKey: "fullName",
    header: "User",
    cell: ({ row }) => (
      <div className="flex flex-col">
        <span className="font-medium">{row.original.fullName}</span>
        <span className="text-xs text-muted-foreground">{row.original.email}</span>
      </div>
    ),
  },
  {
    accessorKey: "role",
    header: "Role",
    cell: ({ row }) => {
      const role = row.original.role;
      return <Badge variant={roleVariantMap[role]} className="capitalize">{role}</Badge>;
    },
  },
  {
    accessorKey: "kycStatus",
    header: "KYC Status",
    cell: ({ row }) => {
        const status = row.original.kycStatus;
        const variant = status === 'verified' ? 'success' : kycVariantMap[status];
        return <Badge variant={variant as any} className="capitalize">{status}</Badge>;
      },
  },
  {
    accessorKey: "balance",
    header: () => <div className="text-right">Wallet Balance</div>,
    cell: ({ row }) => <div className="text-right font-medium">{formatCurrency(row.original.balance)}</div>,
  },
  {
    accessorKey: "createdAt",
    header: "Date Joined",
    cell: ({ row }) => new Date(row.original.createdAt).toLocaleDateString(),
  },
  {
    id: "actions",
    cell: ({ row }) => {
      const user = row.original;
      return (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="h-8 w-8 p-0">
              <span className="sr-only">Open menu</span>
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuLabel>Actions</DropdownMenuLabel>
            <DropdownMenuItem asChild>
              <Link href={`/admin/users/${user.id}`}>View Profile</Link>
            </DropdownMenuItem>
            <DropdownMenuItem>Edit Role</DropdownMenuItem>
            {user.kycStatus === "pending" && (
              <DropdownMenuItem>Verify KYC</DropdownMenuItem>
            )}
            <DropdownMenuSeparator />
            <DropdownMenuItem className="text-red-500">Suspend User</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      );
    },
  },
];