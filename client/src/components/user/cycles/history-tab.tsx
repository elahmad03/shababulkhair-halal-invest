'use client';

import { useState } from 'react';
import { formatCurrency } from '@/lib/utils';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { useGetMemberInvestmentHistoryQuery, useListCyclesQuery } from '@/store/hooks';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { AlertCircle, Loader2 } from 'lucide-react';

type SortField = 'cycleName' | 'amountInvested' | 'profitEarned' | 'totalReturn' | 'completedOn';
type SortDirection = 'asc' | 'desc';

export function HistoryTab() {
  const [sortField, setSortField] = useState<SortField>('completedOn');
  const [sortDirection, setSortDirection] = useState<SortDirection>('desc');

  const { data: historyResponse, isLoading: historyLoading, isError: historyError, error: historyErrorData } = useGetMemberInvestmentHistoryQuery();
  const { data: cyclesResponse, isLoading: cyclesLoading } = useListCyclesQuery({ page: 1, limit: 50 });

  const isLoading = historyLoading || cyclesLoading;
  const isError = historyError;
  const error = historyErrorData;

  const userInvestments = historyResponse?.data ?? [];
  const allCycles = cyclesResponse?.data?.data ?? [];

  // Get completed investments
  const completedInvestments = userInvestments
    .filter((inv) => inv.cycle?.status === 'COMPLETED')
    .map((investment) => {
      const cycle = allCycles.find((c) => c.id === investment.cycleId) ?? investment.cycle;
      const amountInvested = Number(investment.amountInvestedKobo) / 100;
      const profitEarned = Number(investment.profitEarnedKobo ?? 0) / 100;
      const completedDate = investment.cycle?.activeEndsAt
        ? new Date(investment.cycle.activeEndsAt)
        : new Date(investment.createdAt);

      return {
        cycleId: investment.cycleId,
        cycleName: cycle?.cycleName || 'Investment Cycle',
        amountInvested,
        profitEarned,
        totalReturn: amountInvested + profitEarned,
        completedOn: completedDate,
      };
    });

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };

  const sortedInvestments = [...completedInvestments].sort((a, b) => {
    const aValue = a[sortField];
    const bValue = b[sortField];

    if (aValue < bValue) return sortDirection === 'asc' ? -1 : 1;
    if (aValue > bValue) return sortDirection === 'asc' ? 1 : -1;
    return 0;
  });

  // Loading state
  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center space-y-4">
          <Loader2 className="h-8 w-8 animate-spin mx-auto text-primary" />
          <p className="text-muted-foreground">Loading investment history...</p>
        </div>
      </div>
    );
  }

  // Error state
  if (isError) {
    const errorMessage = 
      error && 'data' in error && typeof error.data === 'object' && error.data !== null && 'message' in error.data
        ? (error.data as { message: string }).message
        : "Failed to load investment history. Please try again.";

    return (
      <Alert variant="destructive">
        <AlertCircle className="h-4 w-4" />
        <AlertDescription>
          {errorMessage}
        </AlertDescription>
      </Alert>
    );
  }

  // Empty state
  if (completedInvestments.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-muted-foreground text-lg">
          No completed investments yet. Your investment history will appear here.
        </p>
      </div>
    );
  }

  return (
    <section aria-label="Investment History" className="w-full rounded-md border bg-card">
      <div className="overflow-x-auto w-full">
        <Table>
          <TableHeader>
            <TableRow className="hover:bg-transparent">
              <TableHead
                className="cursor-pointer hover:bg-muted/50 transition-colors"
                onClick={() => handleSort('cycleName')}
              >
                <div className="flex items-center gap-2">
                  Cycle Name
                  {sortField === 'cycleName' && (
                    <span className="text-sm">{sortDirection === 'asc' ? '↑' : '↓'}</span>
                  )}
                </div>
              </TableHead>
              <TableHead
                className="cursor-pointer hover:bg-muted/50 transition-colors"
                onClick={() => handleSort('amountInvested')}
              >
                <div className="flex items-center gap-2">
                  Amount Invested
                  {sortField === 'amountInvested' && (
                    <span className="text-sm">{sortDirection === 'asc' ? '↑' : '↓'}</span>
                  )}
                </div>
              </TableHead>
              <TableHead
                className="cursor-pointer hover:bg-muted/50 transition-colors"
                onClick={() => handleSort('profitEarned')}
              >
                <div className="flex items-center gap-2">
                  Profit Earned
                  {sortField === 'profitEarned' && (
                    <span className="text-sm">{sortDirection === 'asc' ? '↑' : '↓'}</span>
                  )}
                </div>
              </TableHead>
              <TableHead
                className="cursor-pointer hover:bg-muted/50 transition-colors"
                onClick={() => handleSort('totalReturn')}
              >
                <div className="flex items-center gap-2">
                  Total Return
                  {sortField === 'totalReturn' && (
                    <span className="text-sm">{sortDirection === 'asc' ? '↑' : '↓'}</span>
                  )}
                </div>
              </TableHead>
              <TableHead
                className="cursor-pointer hover:bg-muted/50 transition-colors"
                onClick={() => handleSort('completedOn')}
              >
                <div className="flex items-center gap-2">
                  Completed On
                  {sortField === 'completedOn' && (
                    <span className="text-sm">{sortDirection === 'asc' ? '↑' : '↓'}</span>
                  )}
                </div>
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {sortedInvestments.map((investment) => (
              <TableRow key={investment.cycleId} className="hover:bg-muted/50">
                <TableCell className="font-medium text-foreground">{investment.cycleName}</TableCell>
                <TableCell className="font-semibold">{formatCurrency(investment.amountInvested)}</TableCell>
                <TableCell className="font-semibold text-primary">+{formatCurrency(investment.profitEarned)}</TableCell>
                <TableCell className="font-semibold text-primary">{formatCurrency(investment.totalReturn)}</TableCell>
                <TableCell className="text-muted-foreground">
                  {investment.completedOn.toLocaleDateString('en-NG', {
                    year: 'numeric',
                    month: 'short',
                    day: 'numeric',
                  })}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </section>
  );
}