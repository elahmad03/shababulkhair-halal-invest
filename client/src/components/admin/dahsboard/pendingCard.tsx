// /components/admin/dashboard/pending-tasks-card.tsx

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ChevronRight, AlertCircle } from "lucide-react";
import Link from "next/link";

type PendingTasksProps = {
  withdrawalCount: number;
  kycCount: number;
  isError?: boolean;
};

export function PendingTasksCard({ withdrawalCount, kycCount, isError = false }: PendingTasksProps) {
  if (isError) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Pending Tasks</CardTitle>
        </CardHeader>
        <CardContent className="flex items-center gap-2 text-sm text-red-500">
          <AlertCircle className="h-4 w-4" />
          Failed to load pending tasks
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Pending Tasks</CardTitle>
      </CardHeader>
      <CardContent>
        <ul className="space-y-2">
          <li>
            <Link href="/admin/withdrawals" className="flex items-center justify-between rounded-md p-2 hover:bg-secondary">
              <span className="text-sm">
                <strong className="font-bold">{withdrawalCount}</strong> Withdrawal Requests to Review
              </span>
              <ChevronRight className="h-4 w-4 text-muted-foreground" />
            </Link>
          </li>
          <li>
            <Link href="/admin/users?filter=pending_kyc" className="flex items-center justify-between rounded-md p-2 hover:bg-secondary">
              <span className="text-sm">
                <strong className="font-bold">{kycCount}</strong> New KYC Submissions to Verify
              </span>
              <ChevronRight className="h-4 w-4 text-muted-foreground" />
            </Link>
          </li>
        </ul>
      </CardContent>
    </Card>
  );
}