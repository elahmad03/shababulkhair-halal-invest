import { DataTable } from "@/components/user/withdrawals/DataTable"; // Assuming a reusable DataTable component
import { getColumns } from "./Columns";
import { PendingWithdrawal } from "@/app/admin/withdrawals/page";

interface AdminWithdrawalTableProps {
  data: PendingWithdrawal[];
  onAction: (requestId: number) => void;
}

export function AdminWithdrawalTable({ data, onAction }: AdminWithdrawalTableProps) {
    const columns = getColumns({ onAction });
    return <DataTable columns={columns} data={data} />;
}