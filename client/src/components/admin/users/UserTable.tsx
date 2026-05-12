"use client";

import { useState } from "react";
import { Input } from "@/components/ui/input";
import { DataTable } from "@/components/ui/data-table";
import { columns } from "./Columns";
import { User } from "@/store/modules/user";
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
      `${user.firstName} ${user.lastName}`
        .toLowerCase()
        .includes(filter.toLowerCase()) ||
      user.email.toLowerCase().includes(filter.toLowerCase())
  );

  // Transform User to UserTableType for display
  const tableData = filteredUsers.map((user) => ({
    id: parseInt(user.id.slice(0, 8), 16) || 0, // Convert UUID to number
    fullName: `${user.firstName} ${user.lastName}`,
    email: user.email,
    role: (user.role.toLowerCase() as 'member' | 'committee' | 'admin'),
    status: user.status,
    kycStatus: (user.kyc?.status?.toLowerCase() || 'pending') as 'pending' | 'verified' | 'failed',
    investments: user._count?.investments || 0,
    balance: 0, // Placeholder - would need wallet data
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

      {pagination && (
        <div className="flex items-center justify-center py-4">
          <Pagination>
            <PaginationContent>
              <PaginationItem>
                <PaginationPrevious
                  onClick={() => onPageChange?.(Math.max(1, pagination.page - 1))}
                  isActive={pagination.page > 1}
                />
              </PaginationItem>

              {Array.from({ length: pagination.pages }, (_, i) => i + 1).map(
                (pageNum) => (
                  <PaginationItem key={pageNum}>
                    <PaginationLink
                      onClick={() => onPageChange?.(pageNum)}
                      isActive={pageNum === pagination.page}
                    >
                      {pageNum}
                    </PaginationLink>
                  </PaginationItem>
                )
              )}

              <PaginationItem>
                <PaginationNext
                  onClick={() =>
                    onPageChange?.(
                      Math.min(pagination.pages, pagination.page + 1)
                    )
                  }
                  isActive={pagination.page < pagination.pages}
                />
              </PaginationItem>
            </PaginationContent>
          </Pagination>
        </div>
      )}
    </div>
  );
}