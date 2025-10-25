import { getUsersForTable } from "@/lib/data/data";
import { Badge } from "@/components/ui/badge";
import { UserTableClient } from "@/components/admin/users/UserTable";
import HeaderBox from "@/components/common/HeaderBox";

export default async function UserManagementPage() {
  const users = await getUsersForTable();

  return (
    <div className="flex-1 space-y-4 p-4 pt-6 md:p-8">
      <div className="flex items-center justify-between space-y-2">
        <HeaderBox title="User Management" subtext="Oversee, verify, and manage all platform members." />
        <Badge variant="outline">
          {users.length} Total Users
        </Badge>
      </div>
      <UserTableClient users={users} />
    </div>
  );
}