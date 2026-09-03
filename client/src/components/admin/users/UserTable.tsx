"use client";

import { useState } from "react";
import { Input } from "@/components/ui/input";
import { DataTable } from "@/components/ui/data-table";
import { columns } from "./Columns";
import type { User } from "@/store/modules/user/userApi";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";

interface UserTableClientProps {
  users: User[];
  isLoading?: boolean;
  pagination?: {
    page: number;
    limit: number;
    total: number;
    pages: number;
  };
  onPageChange?: (page: number) => void;
}

export function UserTableClient({
  users,
  isLoading = false,
  pagination,
  onPageChange,
}: UserTableClientProps) {
  const [filter, setFilter] = useState("");

  const filteredUsers = users.filter(
    (user) =>
      `${user.firstName} ${user.lastName}`.toLowerCase().includes(filter.toLowerCase()) ||
      user.email.toLowerCase().includes(filter.toLowerCase())
  );

  // Transform User -> table row shape. `id` stays the real UUID string —
  // it's what the detail page route and the API both expect. It was
  // previously hashed into a fake number here purely for display, which
  // broke navigation to /admin/users/[id] with a garbage id.
  const tableData = filteredUsers.map((user) => ({
    id: user.id,
    fullName: `${user.firstName} ${user.lastName}`,
    email: user.email,
    role: user.role.toLowerCase() as "member" | "committee" | "admin",
    status: user.status,
    kycStatus: (user.kyc?.status?.toLowerCase() || "pending") as "pending" | "verified" | "failed",
    investments: user._count?.investments || 0,
    createdAt: new Date(user.createdAt),
    joinDate: new Date(user.createdAt).toLocaleDateString(),
  }));

  if (isLoading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-10 w-full" />
        <Skeleton className="h-64 w-full" />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <Input
        placeholder="Filter by name or email..."
        value={filter}
        onChange={(event) => setFilter(event.target.value)}
        className="max-w-sm"
      />
      <DataTable columns={columns} data={tableData} />

      {pagination && pagination.pages > 1 && (
        <div className="flex items-center justify-center py-4">
          <Pagination>
            <PaginationContent>
              <PaginationItem>
                <PaginationPrevious
                  onClick={() => pagination.page > 1 && onPageChange?.(pagination.page - 1)}
                  aria-disabled={pagination.page <= 1}
                  className={pagination.page <= 1 ? "pointer-events-none opacity-40" : "cursor-pointer"}
                />
              </PaginationItem>

              {Array.from({ length: pagination.pages }, (_, i) => i + 1).map((pageNum) => (
                <PaginationItem key={pageNum}>
                  <PaginationLink
                    onClick={() => onPageChange?.(pageNum)}
                    isActive={pageNum === pagination.page}
                    className="cursor-pointer"
                  >
                    {pageNum}
                  </PaginationLink>
                </PaginationItem>
              ))}

              <PaginationItem>
                <PaginationNext
                  onClick={() =>
                    pagination.page < pagination.pages && onPageChange?.(pagination.page + 1)
                  }
                  aria-disabled={pagination.page >= pagination.pages}
                  className={
                    pagination.page >= pagination.pages ? "pointer-events-none opacity-40" : "cursor-pointer"
                  }
                />
              </PaginationItem>
            </PaginationContent>
          </Pagination>
        </div>
      )}
    </div>
  );
}