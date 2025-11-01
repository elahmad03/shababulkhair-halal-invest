'use client';

import { useState } from 'react';
import { koboToNgn, formatCurrency } from '@/lib/utils';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {  mockInvestmentCycles, mockShareholderInvestments } from '@/db'; 

const CURRENT_USER_ID = 3; // Replace with actual auth context

type SortField = 'cycleName' | 'amountInvested' | 'profitEarned' | 'totalReturn' | 'completedOn';
type SortDirection = 'asc' | 'desc';

export function HistoryTab() {
  const [sortField, setSortField] = useState<SortField>('completedOn');
  const [sortDirection, setSortDirection] = useState<SortDirection>('desc');


  // Get completed investments for the current user
  const completedInvestments = mockShareholderInvestments
    .filter((investment) => {
      const cycle = mockInvestmentCycles.find(
        (c) => c.id === investment.cycleId && c.status === 'completed'
      );
      return investment.userId === CURRENT_USER_ID && cycle;
    })
    .map((investment) => {
      const cycle = mockInvestmentCycles.find(
        (c) => c.id === investment.cycleId
      );
  // Convert stored kobo values (bigint | string) to NGN numbers safely for calculation/sorting
  const amountInvested = koboToNgn(investment.amountInvested as any);
  const profitEarned = koboToNgn(investment.profitEarned as any);
      
      return {
        id: investment.id,
        cycleName: cycle?.name || 'Unknown Cycle',
        amountInvested,
        profitEarned,
        totalReturn: amountInvested + profitEarned,
        completedOn: new Date('2025-08-31'), // Mock date - replace with actual
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
    <div className="w-full rounded-md border">
      <div className="overflow-x-auto w-full">
        <div className="min-w-full">
          <Table>
        <TableHeader>
          <TableRow>
            <TableHead
              className="cursor-pointer hover:bg-muted/50"
              onClick={() => handleSort('cycleName')}
            >
              Cycle Name {sortField === 'cycleName' && (sortDirection === 'asc' ? '↑' : '↓')}
            </TableHead>
            <TableHead
              className="cursor-pointer hover:bg-muted/50"
              onClick={() => handleSort('amountInvested')}
            >
              Amount Invested {sortField === 'amountInvested' && (sortDirection === 'asc' ? '↑' : '↓')}
            </TableHead>
            <TableHead
              className="cursor-pointer hover:bg-muted/50"
              onClick={() => handleSort('profitEarned')}
            >
              Profit Earned {sortField === 'profitEarned' && (sortDirection === 'asc' ? '↑' : '↓')}
            </TableHead>
            <TableHead
              className="cursor-pointer hover:bg-muted/50"
              onClick={() => handleSort('totalReturn')}
            >
              Total Return {sortField === 'totalReturn' && (sortDirection === 'asc' ? '↑' : '↓')}
            </TableHead>
            <TableHead
              className="cursor-pointer hover:bg-muted/50"
              onClick={() => handleSort('completedOn')}
            >
              Completed On {sortField === 'completedOn' && (sortDirection === 'asc' ? '↑' : '↓')}
            </TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {sortedInvestments.map((investment) => (
            <TableRow key={investment.id}>
              <TableCell className="font-medium">{investment.cycleName}</TableCell>
              <TableCell>{formatCurrency(investment.amountInvested)}</TableCell>
              <TableCell className="text-green-400 font-semibold">+{formatCurrency(investment.profitEarned)}</TableCell>
              <TableCell className="font-semibold">{formatCurrency(investment.totalReturn)}</TableCell>
              <TableCell>
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
      </div>
    </div>
  );
}