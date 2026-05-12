// src/app/(admin)/withdrawals/page.tsx
'use client';

import { useState } from 'react';
import { ArrowLeft, Download } from 'lucide-react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { StatusTabs } from '@/components/admin/withdrawals/StatusTab';
import { WithdrawalsTable } from '@/components/admin/withdrawals/WithdrawalsTable';
import { useListWithdrawalsQuery } from '@/store/modules/wallet/walletApi';
import type { WithdrawalRecord } from '@/store/modules/wallet/walletApi';
import { Card, CardContent } from '@/components/ui/card';

// Map from API status to local status type
const statusMap: Record<string, "pending" | "approved" | "processed" | "rejected"> = {
  PENDING: "pending",
  APPROVED: "approved",
  PROCESSED: "processed",
  REJECTED: "rejected",
};

const reverseStatusMap: Record<"pending" | "approved" | "processed" | "rejected", string> = {
  pending: "PENDING",
  approved: "APPROVED",
  processed: "PROCESSED",
  rejected: "REJECTED",
};

type WithdrawalStatus = "pending" | "approved" | "processed" | "rejected";

export default function AdminWithdrawalsPage() {
  const [activeStatus, setActiveStatus] = useState<WithdrawalStatus>('pending');
  const [page, setPage] = useState(1);
  const limit = 10;

  // Fetch withdrawals from server based on status
  const { data: response, isLoading, error } = useListWithdrawalsQuery({
    status: reverseStatusMap[activeStatus],
    page,
    limit,
  });

  const withdrawals = response?.data?.data || [];
  const pagination = response?.data?.pagination;

  // Calculate counts for each status
  const statusCounts = {
    pending: 0, // Will be populated from API if available
    approved: 0,
    processed: 0,
    rejected: 0,
  };

  const handleExport = () => {
    // In production, this would generate a CSV/Excel file
    const csv = withdrawals
      .map(
        (w) =>
          `${w.userName},${w.userEmail},${parseInt(w.amountKobo) / 100},${w.status},${w.bankName},${w.accountNumber}`
      )
      .join('\n');

    const header = 'Name,Email,Amount,Status,Bank,Account\n';
    const element = document.createElement('a');
    element.setAttribute(
      'href',
      'data:text/csv;charset=utf-8,' + encodeURIComponent(header + csv)
    );
    element.setAttribute('download', `withdrawals-${new Date().toISOString()}.csv`);
    element.style.display = 'none';
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="container mx-auto px-4 py-8 max-w-7xl">
        {/* Header */}
        <div className="mb-8">
          <Link href="/admin/dashboard">
            <Button variant="ghost" className="mb-4 -ml-2">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Dashboard
            </Button>
          </Link>
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <h1 className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-emerald-600 to-green-600 bg-clip-text text-transparent">
                Withdrawal Requests
              </h1>
              <p className="text-gray-600 dark:text-gray-400 mt-2">
                Review and manage user payout requests
              </p>
            </div>
            <Button
              onClick={handleExport}
              variant="outline"
              className="flex items-center gap-2"
              disabled={withdrawals.length === 0}
            >
              <Download className="h-4 w-4" />
              Export Data
            </Button>
          </div>
        </div>

        {/* Error State */}
        {error && (
          <Card className="mb-6 border-red-500/50 bg-red-500/5">
            <CardContent className="pt-6 text-red-500">
              Failed to load withdrawals. Please try again.
            </CardContent>
          </Card>
        )}

        {/* Status Tabs */}
        <div className="mb-6">
          <StatusTabs
            activeStatus={activeStatus}
            onChange={setActiveStatus}
            counts={statusCounts}
          />
        </div>

        {/* Withdrawals Table */}
        <WithdrawalsTable
          withdrawals={withdrawals}
          isLoading={isLoading}
          pagination={pagination}
          onPageChange={setPage}
        />
      </div>
    </div>
  );
}