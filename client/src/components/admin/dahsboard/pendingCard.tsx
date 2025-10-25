// /components/admin/dashboard/pending-tasks-card.tsx

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ChevronRight } from "lucide-react";
import Link from "next/link";

type PendingTasksProps = {
  withdrawalCount: number;
  kycCount: number;
};

export function PendingTasksCard({ withdrawalCount, kycCount }: PendingTasksProps) {
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