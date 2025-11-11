// src/app/(admin)/withdrawals/page.tsx
'use client';

import { useState, useMemo } from 'react';
import { ArrowLeft, Download } from 'lucide-react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { StatusTabs } from '@/components/admin/withdrawals/StatusTab';
import { WithdrawalsTable } from '@/components/admin/withdrawals/WithdrawalsTable';
import { mockData } from '@/db';
import type { WithdrawalStatus, WithdrawalWithUser } from '@/types/withdrawal';

export default function AdminWithdrawalsPage() {
  const [activeStatus, setActiveStatus] = useState<WithdrawalStatus>('pending');
  const [refreshKey, setRefreshKey] = useState(0);

  // Combine withdrawal requests with user data
  const withdrawalsWithUsers: WithdrawalWithUser[] = useMemo(() => {
    return mockData.withdrawalRequests.map((request) => {
      const user = mockData.users.find((u) => u.id === request.userId);
      const wallet = mockData.wallets.find((w) => w.userId === request.userId);

      return {
        ...request,
        userName: user?.fullName || 'Unknown User',
        userEmail: user?.email || '',
        walletBalance: wallet?.balance,
      };
    });
  }, [refreshKey]);

  // Filter by status
  const filteredWithdrawals = withdrawalsWithUsers.filter(
    (w) => w.status === activeStatus
  );

  // Calculate counts for each status
  const statusCounts: Record<WithdrawalStatus, number> = {
    pending: withdrawalsWithUsers.filter((w) => w.status === 'pending').length,
    approved: withdrawalsWithUsers.filter((w) => w.status === 'approved').length,
    processed: withdrawalsWithUsers.filter((w) => w.status === 'processed').length,
    rejected: withdrawalsWithUsers.filter((w) => w.status === 'rejected').length,
  };

  const handleUpdate = () => {
    // Trigger a refresh by changing the key
    setRefreshKey((prev) => prev + 1);
  };

  const handleExport = () => {
    // In production, this would generate a CSV/Excel file
    console.log('Exporting withdrawal data...', filteredWithdrawals);
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
            >
              <Download className="h-4 w-4" />
              Export Data
            </Button>
          </div>
        </div>

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
          withdrawals={filteredWithdrawals}
          onUpdate={handleUpdate}
        />
      </div>
    </div>
  );
}