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
import { Card } from '@/components/ui/card';
import { Eye, Clock, CheckCircle2, Ban, DollarSign } from 'lucide-react';
import { formatCurrency } from '@/lib/utils';
import { ReviewRequestDialog } from './ReviewRequestdialog';
import type { WithdrawalWithUser } from '@/types/withdrawal';

interface WithdrawalsTableProps {
  withdrawals: WithdrawalWithUser[];
  onUpdate: () => void;
}

export function WithdrawalsTable({ withdrawals, onUpdate }: WithdrawalsTableProps) {
  const [selectedWithdrawal, setSelectedWithdrawal] = useState<WithdrawalWithUser | null>(null);

  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat('en-NG', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    }).format(new Date(date));
  };

  const formatDateMobile = (date: Date) => {
    return new Intl.DateTimeFormat('en-NG', {
      month: 'short',
      day: 'numeric',
    }).format(new Date(date));
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'pending':
        return (
          <Badge className="bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400">
            <Clock className="h-3 w-3 mr-1" />
            Pending
          </Badge>
        );
      case 'approved':
        return (
          <Badge className="bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400">
            <CheckCircle2 className="h-3 w-3 mr-1" />
            Approved
          </Badge>
        );
      case 'processed':
        return (
          <Badge className="bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400">
            <DollarSign className="h-3 w-3 mr-1" />
            Processed
          </Badge>
        );
      case 'rejected':
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

  const getTypeBadge = (type: string) => {
    switch (type) {
      case 'profit_only':
        return <Badge variant="outline">Profit Only</Badge>;
      case 'full_divestment':
        return <Badge variant="outline">Full Divestment</Badge>;
      default:
        return <Badge variant="outline">Wallet Balance</Badge>;
    }
  };

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
                      {withdrawal.userName.split(' ')[0]} {withdrawal.userName.split(' ')[1]?.[0]}.
                    </p>
                    <p className="text-sm text-gray-500">{formatDateMobile(withdrawal.requestedAt)}</p>
                  </div>
                  {getStatusBadge(withdrawal.status)}
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-lg font-bold text-emerald-600">
                    {formatCurrency(withdrawal.amount)}
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
                <TableHead>Type</TableHead>
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
                      {formatCurrency(withdrawal.amount)}
                    </span>
                  </TableCell>
                  <TableCell>{getTypeBadge(withdrawal.withdrawalType)}</TableCell>
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
      </Card>

      {selectedWithdrawal && (
        <ReviewRequestDialog
          withdrawal={selectedWithdrawal}
          open={!!selectedWithdrawal}
          onClose={() => setSelectedWithdrawal(null)}
          onUpdate={onUpdate}
        />
      )}
    </>
  );
}