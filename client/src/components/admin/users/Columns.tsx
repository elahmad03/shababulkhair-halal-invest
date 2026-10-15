"use client";

import Link from "next/link";
import { ColumnDef } from "@tanstack/react-table";
import {
  CalendarDays,
  Clock3,
  MoreHorizontal,
  ShieldAlert,
  ShieldCheck,
  ShieldQuestion,
  UserRound,
  UserRoundX,
} from "lucide-react";

import type { User } from "@/store/modules/user/userApi";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export type UserRow = {
  id: string;
  fullName: string;
  email: string;
  role: User["role"];
  status: User["status"];
  kycStatus?: string; // raw value from user.kyc?.status
  investments: number;
  createdAt: string;
};

const roleConfig: Record<User["role"], { label: string; className: string }> = {
  ADMIN: {
    label: "Admin",
    className: "border-destructive/30 bg-destructive/10 text-destructive",
  },
  COMMITTEE: {
    label: "Committee",
    className: "border-primary/30 bg-primary/10 text-primary",
  },
  MEMBER: {
    label: "Member",
    className: "border-border bg-muted text-muted-foreground",
  },
};

const statusConfig: Record<User["status"], { label: string; className: string }> = {
  ACTIVE: {
    label: "Active",
    className:
      "border-emerald-500/30 bg-emerald-500/10 text-emerald-700 dark:text-emerald-400",
  },
  SUSPENDED: {
    label: "Suspended",
    className: "border-destructive/30 bg-destructive/10 text-destructive",
  },
  DECEASED: {
    label: "Deceased",
    className: "border-border bg-muted text-muted-foreground",
  },
};

type KycBadge = {
  label: string;
  icon: typeof ShieldCheck;
  className: string;
};

function getKycBadge(raw?: string): KycBadge {
  if (!raw) {
    return {
      label: "Not submitted",
      icon: ShieldAlert,
      className: "border-border bg-muted text-muted-foreground",
    };
  }

  const value = raw.toUpperCase();

  if (value.includes("VERIF") || value.includes("APPROV")) {
    return {
      label: "Verified",
      icon: ShieldCheck,
      className:
        "border-emerald-500/30 bg-emerald-500/10 text-emerald-700 dark:text-emerald-400",
    };
  }

  if (value.includes("REJECT") || value.includes("FAIL")) {
    return {
      label: "Rejected",
      icon: ShieldAlert,
      className: "border-destructive/30 bg-destructive/10 text-destructive",
    };
  }

  if (value.includes("PEND") || value.includes("SUBMIT") || value.includes("REVIEW")) {
    return {
      label: "Pending review",
      icon: Clock3,
      className:
        "border-amber-500/30 bg-amber-500/10 text-amber-700 dark:text-amber-400",
    };
  }

  // Unrecognised backend value: show it as-is rather than guessing
  const pretty = raw.replace(/[_-]+/g, " ").toLowerCase();
  return {
    label: pretty.charAt(0).toUpperCase() + pretty.slice(1),
    icon: ShieldQuestion,
    className: "border-border bg-muted text-muted-foreground",
  };
}

export const columns: ColumnDef<UserRow>[] = [
  {
    accessorKey: "fullName",
    header: "User",
    cell: ({ row }) => {
      const user = row.original;

      return (
        <Link
          href={`/admin/users/${user.id}`}
          className="group flex min-w-0 items-center gap-3"
        >
          <div className="flex size-10 shrink-0 items-center justify-center rounded-full border bg-muted text-muted-foreground">
            <UserRound className="size-5" />
          </div>

          <div className="flex min-w-0 flex-col gap-1">
            <span className="truncate font-medium transition-colors group-hover:text-primary">
              {user.fullName}
            </span>
            <span className="truncate text-xs text-muted-foreground">
              {user.email}
            </span>
          </div>
        </Link>
      );
    },
  },
  {
    accessorKey: "role",
    header: "Role",
    cell: ({ row }) => {
      const config = roleConfig[row.original.role];

      return (
        <Badge variant="outline" className={config.className}>
          {config.label}
        </Badge>
      );
    },
  },
  {
    accessorKey: "status",
    header: "Account status",
    cell: ({ row }) => {
      const config = statusConfig[row.original.status];

      return (
        <Badge variant="outline" className={config.className}>
          {config.label}
        </Badge>
      );
    },
  },
  {
    accessorKey: "kycStatus",
    header: "KYC verification",
    cell: ({ row }) => {
      const config = getKycBadge(row.original.kycStatus);
      const Icon = config.icon;

      return (
        <Badge variant="outline" className={config.className}>
          <Icon className="mr-1 size-3.5" />
          {config.label}
        </Badge>
      );
    },
  },
  {
    accessorKey: "investments",
    header: "Investments",
    cell: ({ row }) => (
      <span className="text-sm tabular-nums">{row.original.investments}</span>
    ),
  },
  {
    accessorKey: "createdAt",
    header: "Date joined",
    cell: ({ row }) => {
      const date = new Date(row.original.createdAt);

      return (
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <CalendarDays className="size-4 shrink-0" />
          <span>
            {Number.isNaN(date.getTime())
              ? "—"
              : new Intl.DateTimeFormat("en-NG", {
                  day: "2-digit",
                  month: "short",
                  year: "numeric",
                }).format(date)}
          </span>
        </div>
      );
    },
  },
  {
    id: "actions",
    header: "",
    enableHiding: false,
    cell: ({ row }) => {
      const user = row.original;

      return (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              className="size-9 rounded-full"
              aria-label={`Actions for ${user.fullName}`}
            >
              <MoreHorizontal className="size-4" />
            </Button>
          </DropdownMenuTrigger>

          <DropdownMenuContent align="end" className="w-52">
            <DropdownMenuLabel className="text-xs font-normal text-muted-foreground">
              Manage user
            </DropdownMenuLabel>

            <DropdownMenuItem asChild>
              <Link href={`/admin/users/${user.id}`}>
                <UserRound className="mr-2 size-4" />
                View profile
              </Link>
            </DropdownMenuItem>

            <DropdownMenuSeparator />

            <DropdownMenuItem
              disabled
              className="text-destructive focus:text-destructive"
            >
              <UserRoundX className="mr-2 size-4" />
              Suspend user
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      );
    },
  },
];