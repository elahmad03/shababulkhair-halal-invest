'use client';

import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { ArrowDown } from 'lucide-react';

interface WalletAmountInputProps {
  balance: bigint;
  amount: string;
  onChange: (amount: string) => void;
}

export function WalletAmountInput({ balance, amount, onChange }: WalletAmountInputProps) {
  const formatCurrency = (value: bigint) => {
    return new Intl.NumberFormat('en-NG', {
      style: 'currency',
      currency: 'NGN',
      minimumFractionDigits: 0,
    }).format(Number(value));
  };

  const handleMaxClick = () => {
    onChange(Number(balance).toString());
  };

  return (
    <Card className="p-6 bg-gradient-to-br from-emerald-50 to-green-50 dark:from-emerald-950/20 dark:to-green-950/20 border-emerald-200 dark:border-emerald-800">
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <Label className="text-sm font-medium text-gray-700 dark:text-gray-300">
            Available Balance
          </Label>
          <span className="text-2xl font-bold bg-gradient-to-r from-emerald-600 to-green-600 bg-clip-text text-transparent">
            {formatCurrency(balance)}
          </span>
        </div>

        <div className="flex justify-center py-2">
          <ArrowDown className="h-5 w-5 text-emerald-600 animate-bounce" />
        </div>

        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <Label htmlFor="amount" className="text-sm font-medium">
              Withdrawal Amount
            </Label>
            <button
              type="button"
              onClick={handleMaxClick}
              className="text-xs font-medium text-emerald-600 hover:text-emerald-700 transition-colors"
            >
              MAX
            </button>
          </div>
          <div className="relative">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 font-medium">
              ₦
            </span>
            <Input
              id="amount"
              type="number"
              placeholder="0"
              value={amount}
              onChange={(e) => onChange(e.target.value)}
              className="pl-8 text-lg font-semibold h-14 border-emerald-300 focus:border-emerald-500 focus:ring-emerald-500"
            />
          </div>
        </div>
      </div>
    </Card>
  );
}