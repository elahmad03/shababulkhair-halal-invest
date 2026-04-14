// src/components/wallet/TransactionHistory.tsx
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
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Search, Filter } from 'lucide-react';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';

interface Transaction {
  id: number;
  type: string;
  description: string | null;
  amount: number;
  status: 'completed' | 'pending' | 'failed';
  createdAt: Date;
}

interface TransactionHistoryProps {
  transactions: Transaction[];
}

export const TransactionHistory: React.FC<TransactionHistoryProps> = ({ transactions }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');

  // Filter transactions based on search and status
  const filteredTransactions = transactions.filter((tx) => {
    const matchesSearch = 
      tx.type.toLowerCase().includes(searchQuery.toLowerCase()) ||
      tx.description?.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesStatus = statusFilter === 'all' || tx.status === statusFilter;
    
    return matchesSearch && matchesStatus;
  });

  // Helper function to determine if transaction is positive
  const isPositiveTransaction = (type: string) => {
    return ['deposit', 'capital_return', 'profit_distribution', 'refund'].includes(type);
  };

  // Status badge variants
  const getStatusBadge = (status: Transaction['status']) => {
    const variants = {
      completed: { label: 'Completed', className: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' },
      pending: { label: 'Pending', className: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400' },
      failed: { label: 'Failed', className: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400' },
    };
    
    return variants[status];
  };

  return (
    <Card className="shadow-lg border-none">
      <CardHeader>
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <CardTitle className="text-2xl font-semibold">Transaction History</CardTitle>
          
          {/* Search and Filter Controls */}
          <div className="flex flex-col sm:flex-row gap-3">
            {/* Search Input */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
              <Input
                type="text"
                placeholder="Search transactions..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 w-full sm:w-64"
              />
            </div>

            {/* Status Filter */}
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-full sm:w-40">
                <Filter className="w-4 h-4 mr-2" />
                <SelectValue placeholder="Filter" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="completed">Completed</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="failed">Failed</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </CardHeader>

      <CardContent className="p-0">
        <div className="overflow-x-auto w-full">
          <div className="min-w-full">
            <Table>
            <TableHeader>
              <TableRow className="hover:bg-transparent">
                <TableHead className="font-semibold">Transaction</TableHead>
                <TableHead className="font-semibold">Date</TableHead>
                <TableHead className="text-right font-semibold">Amount</TableHead>
                <TableHead className="text-center font-semibold">Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredTransactions.length > 0 ? (
                filteredTransactions.map((tx) => {
                  const isPositive = isPositiveTransaction(tx.type);
                  const statusBadge = getStatusBadge(tx.status);

                  return (
                    <TableRow key={tx.id} className="hover:bg-gray-50 dark:hover:bg-gray-800/50">
                      {/* Transaction Type & Description */}
                      <TableCell>
                        <div className="space-y-1">
                          <p className="font-medium text-gray-900 dark:text-gray-100 capitalize">
                            {tx.type.replace(/_/g, ' ')}
                          </p>
                          {tx.description && (
                            <p className="text-sm text-gray-500 dark:text-gray-400 line-clamp-1">
                              {tx.description}
                            </p>
                          )}
                        </div>
                      </TableCell>

                      {/* Date */}
                      <TableCell className="text-gray-600 dark:text-gray-300">
                        {format(new Date(tx.createdAt), 'MMM dd, yyyy')}
                        <span className="block text-xs text-gray-400 dark:text-gray-500">
                          {format(new Date(tx.createdAt), 'HH:mm')}
                        </span>
                      </TableCell>

                      {/* Amount (Color-coded) */}
                      <TableCell className="text-right">
                        <span
                          className={cn(
                            'font-semibold text-lg',
                            isPositive
                              ? 'text-green-600 dark:text-green-400'
                              : 'text-red-600 dark:text-red-400'
                          )}
                        >
                          {isPositive ? '+' : '-'}₦{Math.abs(tx.amount).toLocaleString('en-NG', {
                            minimumFractionDigits: 2,
                            maximumFractionDigits: 2,
                          })}
                        </span>
                      </TableCell>

                      {/* Status Badge */}
                      <TableCell className="text-center">
                        <Badge 
                          variant="secondary" 
                          className={cn('font-medium', statusBadge.className)}
                        >
                          {statusBadge.label}
                        </Badge>
                      </TableCell>
                    </TableRow>
                  );
                })
              ) : (
                <TableRow>
                  <TableCell colSpan={4} className="text-center py-12">
                    <div className="text-gray-500 dark:text-gray-400">
                      <p className="text-lg font-medium">No transactions found</p>
                      <p className="text-sm mt-1">
                        {searchQuery || statusFilter !== 'all'
                          ? 'Try adjusting your filters'
                          : 'Your transaction history will appear here'}
                      </p>
                    </div>
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
            </Table>
          </div>
        </div>

        {/* Pagination (Optional - Add if needed) */}
        {filteredTransactions.length > 10 && (
          <div className="flex items-center justify-between px-6 py-4 border-t">
            <p className="text-sm text-gray-500">
              Showing {filteredTransactions.length} transactions
            </p>
            <div className="flex gap-2">
              <Button variant="outline" size="sm" disabled>
                Previous
              </Button>
              <Button variant="outline" size="sm" disabled>
                Next
              </Button>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};