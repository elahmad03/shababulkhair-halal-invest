
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { ArrowUpRight, ArrowDownLeft, Clock, DollarSign, Plus } from 'lucide-react';
import Link from 'next/link';
// FIX: We cannot import Transaction type from the schemas/app if it's not exported.
// We must define a local interface that strictly matches the properties we use.
// This is done to maintain component independence from the full Zod object.
interface Transaction {
    type: 'deposit' | 'share_purchase' | 'capital_return' | 'profit_distribution' | 'withdrawal';
    amount: number; // Zod transforms this to number
    status: 'pending' | 'completed' | 'failed';
    description: string | null;
    createdAt: Date;
    id: number;
}
// This local definition is necessary because TypeScript requires the type,
// and we cannot rely on an export that wasn't shown.

import { cn } from '@/lib/utils';
import { format } from 'date-fns';

/**
 * Interface for the data passed to the WalletSummaryCard.
 */
interface WalletSummaryData {
  balance: number;
  recentTransactions: Transaction[];
}

// --- Sub-Component: Transaction Item ---
const TransactionItem: React.FC<{ transaction: Transaction }> = ({ transaction }) => {
  // Logic remains the same, but now uses the locally defined 'Transaction' interface.
  const isPositive = ['deposit', 'capital_return', 'profit_distribution'].includes(transaction.type);
  const icon = isPositive ? (
    <ArrowUpRight className="h-5 w-5 text-green-600 dark:text-green-400" />
  ) : (
    <ArrowDownLeft className="h-5 w-5 text-red-600 dark:text-red-400" />
  );

  const amountColor = isPositive ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400';

  const statusMap: Record<Transaction['status'], { text: string, color: string }> = {
    completed: { text: 'Completed', color: 'text-green-500 dark:text-green-400' },
    pending: { text: 'Pending', color: 'text-amber-500 dark:text-amber-400' },
    failed: { text: 'Failed', color: 'text-red-500 dark:text-red-400' },
  };

  const amountValue = transaction.amount; 
  const formattedAmount = `₦${amountValue.toFixed(2)}`;

  return (
    <div className="flex items-center justify-between py-4 border-b last:border-b-0 dark:border-gray-800">
      <div className="flex items-center space-x-4">
        <div className="p-2 rounded-full bg-gray-100 dark:bg-gray-700">
          {icon}
        </div>
        <div>
          <p className="font-medium capitalize text-gray-900 dark:text-gray-100">
            {transaction.type.replace('_', ' ')}
          </p>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            {transaction.description || 'General transaction'}
          </p>
        </div>
      </div>
      
      <div className="text-right">
        <p className={cn('font-semibold', amountColor)}>
          {isPositive ? '+' : '-'} {formattedAmount}
        </p>
        <p className={cn('text-xs', statusMap[transaction.status].color)}>
          {statusMap[transaction.status].text} • {format(transaction.createdAt, 'MMM d, h:mma')}
        </p>
      </div>
    </div>
  );
};

// --- Main Component ---
export const WalletSummaryCard: React.FC<WalletSummaryData> = ({ balance, recentTransactions }) => {
  // ... (Rest of the component rendering is identical to the previous step)
  return (
    <div className="space-y-8 max-w-6xl mx-auto">
      {/* 1. Balance Summary Card (with correct number type usage) */}
      <Card className="shadow-2xl bg-ember-green-700 dark:bg-gray-800 text-white border-0">
        <CardHeader>
          <CardDescription className="text-ember-green-200 dark:text-gray-400 flex items-center space-x-2">
            <DollarSign className="w-4 h-4" />
            <span>Current Available Balance</span>
          </CardDescription>
          <CardTitle className="text-6xl font-extrabold tracking-tight pt-2">
            ₦{balance.toFixed(2)}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-ember-green-200 dark:text-gray-500">
            Last updated: {format(new Date(), 'dd MMMM yyyy, h:mma')}
          </p>
        </CardContent>
      </Card>

      {/* 2. Quick Actions */}
      <Card className="shadow-lg">
        <CardContent className="p-6 flex flex-col md:flex-row space-y-4 md:space-y-0 md:space-x-4">
          <Link href="/transactions/deposit" className="flex-1" passHref>
            <Button className="w-full text-lg py-7 bg-ember-green-600 hover:bg-ember-green-700 dark:bg-ember-green-500 dark:hover:bg-ember-green-600">
              <Plus className="w-5 h-5 mr-3" />
              Deposit Funds
            </Button>
          </Link>
          <Link href="/transactions/withdraw" className="flex-1" passHref>
            <Button variant="outline" className="w-full text-lg py-7 border-ember-green-600 text-ember-green-700 dark:text-ember-green-500 dark:border-ember-green-500 hover:bg-ember-green-50 dark:hover:bg-gray-700">
              <ArrowDownLeft className="w-5 h-5 mr-3" />
              Request Withdrawal
            </Button>
          </Link>
        </CardContent>
      </Card>

      {/* 3. Recent Transaction History */}
      <Card className="shadow-lg">
        <CardHeader>
          <CardTitle className="text-2xl font-semibold flex items-center space-x-2">
            <Clock className="w-5 h-5 text-gray-500" />
            <span>Recent Transaction History</span>
          </CardTitle>
          <CardDescription>
            The last {recentTransactions.length} movements in your Shababul Khair wallet.
          </CardDescription>
        </CardHeader>
        <Separator className="dark:bg-gray-800" />
        <CardContent className="p-6">
          {recentTransactions.length > 0 ? (
            <div className="divide-y divide-gray-100 dark:divide-gray-800">
              {recentTransactions.map(tx => (
                <TransactionItem key={tx.id} transaction={tx} />
              ))}
            </div>
          ) : (
            <div className="text-center py-10 text-gray-500 dark:text-gray-400">
              No transactions recorded yet. Use the buttons above to get started.
            </div>
          )}
        </CardContent>
      </Card>

      {/* Link to Full History */}
      <div className="text-center pt-4">
        <Link href="/transactions" passHref>
          <Button variant="link" className="text-ember-green-700 dark:text-ember-green-500 hover:underline">
            View All Transactions History &rarr;
          </Button>
        </Link>
      </div>
    </div>
  );
};