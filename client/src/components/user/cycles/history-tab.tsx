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
import { mockData } from '@/db/mockData'; 

const CURRENT_USER_ID = 3; // Replace with actual auth context

type SortField = 'cycleName' | 'amountInvested' | 'profitEarned' | 'totalReturn' | 'completedOn';
type SortDirection = 'asc' | 'desc';

export function HistoryTab() {
  const [sortField, setSortField] = useState<SortField>('completedOn');
  const [sortDirection, setSortDirection] = useState<SortDirection>('desc');

  // Get completed investments for the current user
  const completedInvestments = mockData.shareholderInvestments
    .filter((investment) => {
      const cycle = mockData.investmentCycles.find(
        (c) => c.id === investment.cycleId && c.status === 'completed'
      );
      return investment.userId === CURRENT_USER_ID && cycle;
    })
    .map((investment) => {
      const cycle = mockData.investmentCycles.find(
        (c) => c.id === investment.cycleId
      );
      // Convert string amounts to numbers
      const amountInvested = parseFloat(investment.amountInvested);
      const profitEarned = parseFloat(investment.profitEarned);
      
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
    <div className="w-full overflow-auto rounded-md border">
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
              <TableCell>
                ₦{investment.amountInvested.toLocaleString('en-NG', {
                  minimumFractionDigits: 2,
                  maximumFractionDigits: 2,
                })}
              </TableCell>
              <TableCell className="text-green-400 font-semibold">
                +₦{investment.profitEarned.toLocaleString('en-NG', {
                  minimumFractionDigits: 2,
                  maximumFractionDigits: 2,
                })}
              </TableCell>
              <TableCell className="font-semibold">
                ₦{investment.totalReturn.toLocaleString('en-NG', {
                  minimumFractionDigits: 2,
                  maximumFractionDigits: 2,
                })}
              </TableCell>
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
  );
}