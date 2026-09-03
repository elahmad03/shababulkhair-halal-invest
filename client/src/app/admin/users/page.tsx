"use client";

import React from "react";
import { Badge } from "@/components/ui/badge";
import { UserTableClient } from "@/components/admin/users/UserTable";
import HeaderBox from "@/components/common/HeaderBox";
import { useListUsersQuery } from "@/store/modules/user/userApi";
import { Skeleton } from "@/components/ui/skeleton";

export default function UserManagementPage() {
  const [page, setPage] = React.useState(1);
  const { data, isLoading, error } = useListUsersQuery({
    page,
    limit: 10,
  });

  if (error) {
    return (
      <div className="flex-1 space-y-4 p-4 pt-6 md:p-8">
        <div className="text-sm text-destructive">Error loading users. Please try again.</div>
      </div>
    );
  }

  return (
    <div className="flex-1 space-y-4 p-4 pt-6 md:p-8">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between sm:space-y-2">
        <HeaderBox title="User Management" subtext="Oversee, verify, and manage all investors members." />
        <Badge variant="outline" className="w-fit">
          {isLoading ? <Skeleton className="h-4 w-16" /> : `${data?.pagination.total || 0} Total Users`}
        </Badge>
      </div>
      <UserTableClient
        users={data?.data || []}
        isLoading={isLoading}
        pagination={data?.pagination}
        onPageChange={setPage}
      />
    </div>
  );
}