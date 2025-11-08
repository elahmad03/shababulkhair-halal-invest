import { WithdrawalRequest } from "@/db";
import { DataTable } from "./DataTable"; 
import { columns } from "./Columns"; 

interface WithdrawalHistoryProps {
  history: WithdrawalRequest[];
}

export function WithdrawalHistory({ history }: WithdrawalHistoryProps) {
  return (
    <div className="w-full space-y-4">
      <h2 className="text-2xl font-bold">Withdrawal History</h2>
      <div className="overflow-x-auto">
        <DataTable columns={columns} data={history} />
      </div>
    </div>
  );
}