// src/components/withdraw/source-selector.tsx
'use client';

import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Wallet, TrendingDown } from 'lucide-react';
import type { WithdrawalSource } from '@/db/types';

interface SourceSelectorProps {
  value: WithdrawalSource;
  onChange: (value: WithdrawalSource) => void;
}

export function SourceSelector({ value, onChange }: SourceSelectorProps) {
  return (
    <div className="space-y-2">
      <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
        Withdrawal Source
      </label>
      <Tabs value={value} onValueChange={(v) => onChange(v as WithdrawalSource)} className="w-full">
        <TabsList className="grid w-full grid-cols-2 h-auto p-1">
          <TabsTrigger 
            value="wallet" 
            className="flex items-center gap-2 py-3 data-[state=active]:bg-gradient-to-r data-[state=active]:from-emerald-500 data-[state=active]:to-green-600 data-[state=active]:text-white"
          >
            <Wallet className="h-4 w-4" />
            <span className="font-medium">Wallet Balance</span>
          </TabsTrigger>
          <TabsTrigger 
            value="divest" 
            className="flex items-center gap-2 py-3 data-[state=active]:bg-gradient-to-r data-[state=active]:from-emerald-500 data-[state=active]:to-green-600 data-[state=active]:text-white"
          >
            <TrendingDown className="h-4 w-4" />
            <span className="font-medium">Divest Cycle</span>
          </TabsTrigger>
        </TabsList>
      </Tabs>
    </div>
  );
}