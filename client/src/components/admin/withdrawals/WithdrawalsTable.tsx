// src/components/admin/withdrawals/withdrawals-table.tsx
'use client';

import { useState } from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Eye, Clock, CheckCircle2, Ban, DollarSign, Loader2 } from 'lucide-react';
import { formatCurrency } from '@/lib/utils';
import { ReviewRequestDialog } from './ReviewRequestdialog';
import type { WithdrawalRecord } from '@/store/modules/wallet/walletApi';
import { Skeleton } from '@/components/ui/skeleton';

interface WithdrawalsTableProps {
  withdrawals: WithdrawalRecord[];
  isLoading?: boolean;
  pagination?: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
  onPageChange?: (page: number) => void;
}

export function WithdrawalsTable({
  withdrawals,
  isLoading,
  pagination,
  onPageChange,
}: WithdrawalsTableProps) {
  const [selectedWithdrawal, setSelectedWithdrawal] = useState<WithdrawalRecord | null>(null);

  const formatDate = (date: string) => {
    return new Intl.DateTimeFormat('en-NG', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    }).format(new Date(date));
  };

  const formatDateMobile = (date: string) => {
    return new Intl.DateTimeFormat('en-NG', {
      month: 'short',
      day: 'numeric',
    }).format(new Date(date));
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'PENDING':
        return (
          <Badge className="bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400">
            <Clock className="h-3 w-3 mr-1" />
            Pending
          </Badge>
        );
      case 'APPROVED':
        return (
          <Badge className="bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400">
            <CheckCircle2 className="h-3 w-3 mr-1" />
            Approved
          </Badge>
        );
      case 'PROCESSED':
        return (
          <Badge className="bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400">
            <DollarSign className="h-3 w-3 mr-1" />
            Processed
          </Badge>
        );
      case 'REJECTED':
        return (
          <Badge className="bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400">
            <Ban className="h-3 w-3 mr-1" />
            Rejected
          </Badge>
        );
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  if (isLoading) {
    return (
      <Card>
        <div className="space-y-4 p-4">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="flex items-center gap-4 py-2">
              <Skeleton className="h-4 w-1/4" />
              <Skeleton className="h-4 w-1/4" />
              <Skeleton className="h-4 w-1/4" />
              <Skeleton className="h-4 w-1/4" />
            </div>
          ))}
        </div>
      </Card>
    );
  }

  if (withdrawals.length === 0) {
    return (
      <Card className="p-8">
        <div className="text-center text-gray-500">
          <p className="text-lg font-medium">No withdrawal requests found</p>
          <p className="text-sm mt-1">Requests will appear here when users submit them</p>
        </div>
      </Card>
    );
  }

  return (
    <>
      <Card className="overflow-hidden">
        {/* Mobile View */}
        <div className="block md:hidden">
          <div className="divide-y divide-gray-200 dark:divide-gray-700">
            {withdrawals.map((withdrawal) => (
              <div key={withdrawal.id} className="p-4 space-y-3">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="font-semibold text-gray-900 dark:text-white">
                      {withdrawal.userName}
                    </p>
                    <p className="text-sm text-gray-500">{formatDateMobile(withdrawal.requestedAt)}</p>
                  </div>
                  {getStatusBadge(withdrawal.status)}
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-lg font-bold text-emerald-600">
                    {formatCurrency(parseInt(withdrawal.amountKobo) / 100)}
                  </span>
                  <Button
                    size="sm"
                    onClick={() => setSelectedWithdrawal(withdrawal)}
                    className="bg-gradient-to-r from-emerald-500 to-green-600 hover:from-emerald-600 hover:to-green-700"
                  >
                    <Eye className="h-4 w-4 mr-1" />
                    Review
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Desktop View */}
        <div className="hidden md:block overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>User</TableHead>
                <TableHead>Amount Requested</TableHead>
                <TableHead>Bank</TableHead>
                <TableHead>Date Requested</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {withdrawals.map((withdrawal) => (
                <TableRow key={withdrawal.id}>
                  <TableCell>
                    <div>
                      <p className="font-medium text-gray-900 dark:text-white">
                        {withdrawal.userName}
                      </p>
                      <p className="text-sm text-gray-500">{withdrawal.userEmail}</p>
                    </div>
                  </TableCell>
                  <TableCell>
                    <span className="font-bold text-emerald-600">
                      {formatCurrency(parseInt(withdrawal.amountKobo) / 100)}
                    </span>
                  </TableCell>
                  <TableCell>
                    <div>
                      <p className="font-medium">{withdrawal.bankName}</p>
                      <p className="text-sm text-gray-500">
                        {withdrawal.accountNumber.slice(-4).padStart(10, '•')}
                      </p>
                    </div>
                  </TableCell>
                  <TableCell className="text-sm">
                    {formatDate(withdrawal.requestedAt)}
                  </TableCell>
                  <TableCell>{getStatusBadge(withdrawal.status)}</TableCell>
                  <TableCell className="text-right">
                    <Button
                      size="sm"
                      onClick={() => setSelectedWithdrawal(withdrawal)}
                      className="bg-gradient-to-r from-emerald-500 to-green-600 hover:from-emerald-600 hover:to-green-700"
                    >
                      <Eye className="h-4 w-4 mr-1" />
                      Review
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>

        {/* Pagination */}
        {pagination && pagination.totalPages > 1 && (
          <div className="flex items-center justify-between border-t border-gray-200 dark:border-gray-700 px-6 py-4">
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Showing {pagination.page} of {pagination.totalPages} pages ({pagination.total} total)
            </p>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                disabled={pagination.page === 1}
                onClick={() => onPageChange?.(pagination.page - 1)}
              >
                Previous
              </Button>
              <Button
                variant="outline"
                size="sm"
                disabled={pagination.page === pagination.totalPages}
                onClick={() => onPageChange?.(pagination.page + 1)}
              >
                Next
              </Button>
            </div>
          </div>
        )}
      </Card>

      {/* Review Dialog */}
      {selectedWithdrawal && (
        <ReviewRequestDialog
          withdrawal={selectedWithdrawal}
          isOpen={!!selectedWithdrawal}
          onClose={() => setSelectedWithdrawal(null)}
        />
      )}
    </>
  );
}