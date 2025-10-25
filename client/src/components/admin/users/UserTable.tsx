"use client";

import { useState } from "react";
import { Input } from "@/components/ui/input";
import { DataTable } from "@/components/ui/data-table"; // Assumes you have a generic DataTable component
import { columns } from "./Columns";
import { UserTableType } from "@/lib/types/dashboard";

interface UserTableClientProps {
  users: UserTableType[];
}

export function UserTableClient({ users }: UserTableClientProps) {
  const [filter, setFilter] = useState("");

  const filteredUsers = users.filter(
    (user) =>
      user.fullName.toLowerCase().includes(filter.toLowerCase()) ||
      user.email.toLowerCase().includes(filter.toLowerCase())
  );

  return (
    <div className="space-y-4">
      <Input
        placeholder="Filter by name or email..."
        value={filter}
        onChange={(event) => setFilter(event.target.value)}
        className="max-w-sm"
      />
      <DataTable columns={columns} data={filteredUsers} />
    </div>
  );
}