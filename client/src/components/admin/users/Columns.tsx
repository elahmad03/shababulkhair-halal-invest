"use client";

import Link from "next/link";
import { ColumnDef } from "@tanstack/react-table";
import {
  ArrowUpRight,
  CalendarDays,
  CheckCircle2,
  Clock3,
  FileCheck2,
  MoreHorizontal,
  ShieldAlert,
  ShieldCheck,
  UserRound,
  UserRoundX,
} from "lucide-react";

import { UserTableType } from "@/lib/types/dashboard";
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

type KycStatus =
  | "NOT_SUBMITTED"
  | "PENDING_REVIEW"
  | "VERIFIED"
  | "REJECTED";

const roleConfig: Record<
  UserTableType["role"],
  { label: string; className: string }
> = {
  admin: {
    label: "Admin",
    className: "border-destructive/30 bg-destructive/10 text-destructive",
  },
  committee: {
    label: "Committee",
    className: "border-primary/30 bg-primary/10 text-primary",
  },
  member: {
    label: "Member",
    className: "border-border bg-muted text-muted-foreground",
  },
};

const kycConfig: Record<
  KycStatus,
  {
    label: string;
    icon: typeof ShieldCheck;
    className: string;
  }
> = {
  NOT_SUBMITTED: {
    label: "Not submitted",
    icon: ShieldAlert,
    className: "border-border bg-muted text-muted-foreground",
  },
  PENDING_REVIEW: {
    label: "Pending review",
    icon: Clock3,
    className:
      "border-amber-500/30 bg-amber-500/10 text-amber-700 dark:text-amber-400",
  },
  VERIFIED: {
    label: "Verified",
    icon: ShieldCheck,
    className:
      "border-emerald-500/30 bg-emerald-500/10 text-emerald-700 dark:text-emerald-400",
  },
  REJECTED: {
    label: "Rejected",
    icon: ShieldAlert,
    className:
      "border-destructive/30 bg-destructive/10 text-destructive",
  },
};

export const columns: ColumnDef<UserTableType>[] = [
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
        <Badge
          variant="outline"
          className={config.className}
        >
          {config.label}
        </Badge>
      );
    },
  },
  {
    accessorKey: "kycStatus",
    header: "KYC verification",
    cell: ({ row }) => {
      const status = row.original.kycStatus as KycStatus;
      const config = kycConfig[status];
      const Icon = config?.icon;

      if (!config || !Icon) {
        return (
          <Badge variant="outline">
            Unknown status
          </Badge>
        );
      }

      return (
        <div className="flex flex-col items-start gap-1.5">
          <Badge
            variant="outline"
            className={config.className}
          >
            <Icon className="mr-1 size-3.5" />
            {config.label}
          </Badge>

          {status === "PENDING_REVIEW" &&
            row.original.hasKycDocuments && (
              <Link
                href={`/admin/kyc/${row.original.id}`}
                className="inline-flex items-center gap-1 text-xs font-medium text-primary hover:underline"
              >
                <FileCheck2 className="size-3.5" />
                Verify KYC
                <ArrowUpRight className="size-3" />
              </Link>
            )}
        </div>
      );
    },
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
      const canReviewKyc =
        user.kycStatus === "PENDING_REVIEW" &&
        user.hasKycDocuments;

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

            {canReviewKyc && (
              <DropdownMenuItem asChild>
                <Link href={`/admin/kyc/${user.id}`}>
                  <FileCheck2 className="mr-2 size-4" />
                  Review KYC documents
                </Link>
              </DropdownMenuItem>
            )}

            {user.kycStatus === "VERIFIED" && (
              <DropdownMenuItem disabled>
                <CheckCircle2 className="mr-2 size-4" />
                Identity verified
              </DropdownMenuItem>
            )}

            {user.kycStatus === "REJECTED" && (
              <DropdownMenuItem disabled>
                <ShieldAlert className="mr-2 size-4" />
                KYC rejected
              </DropdownMenuItem>
            )}

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