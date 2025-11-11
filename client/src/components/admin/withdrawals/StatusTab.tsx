// src/components/admin/withdrawals/status-tabs.tsx
'use client';

import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Clock, CheckCircle2, Ban, DollarSign } from 'lucide-react';
import type { WithdrawalStatus } from '@/types/withdrawal';

interface StatusTabsProps {
  activeStatus: WithdrawalStatus;
  onChange: (status: WithdrawalStatus) => void;
  counts: Record<WithdrawalStatus, number>;
}

export function StatusTabs({ activeStatus, onChange, counts }: StatusTabsProps) {
  const tabs = [
    {
      value: 'pending' as WithdrawalStatus,
      label: 'Pending',
      icon: Clock,
      color: 'text-yellow-600',
    },
    {
      value: 'approved' as WithdrawalStatus,
      label: 'Approved',
      icon: CheckCircle2,
      color: 'text-blue-600',
    },
    {
      value: 'processed' as WithdrawalStatus,
      label: 'Processed',
      icon: DollarSign,
      color: 'text-green-600',
    },
    {
      value: 'rejected' as WithdrawalStatus,
      label: 'Rejected',
      icon: Ban,
      color: 'text-red-600',
    },
  ];

  return (
    <Tabs value={activeStatus} onValueChange={(v) => onChange(v as WithdrawalStatus)} className="w-full">
      <TabsList className="grid w-full grid-cols-2 md:grid-cols-4 h-auto p-1 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700">
        {tabs.map((tab) => (
          <TabsTrigger
            key={tab.value}
            value={tab.value}
            className="flex items-center gap-2 py-3 data-[state=active]:bg-gradient-to-r data-[state=active]:from-emerald-500 data-[state=active]:to-green-600 data-[state=active]:text-white"
          >
            <tab.icon className={`h-4 w-4 ${activeStatus === tab.value ? '' : tab.color}`} />
            <span className="font-medium">{tab.label}</span>
            <Badge
              variant="secondary"
              className={`ml-1 ${
                activeStatus === tab.value
                  ? 'bg-white/20 text-white'
                  : 'bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300'
              }`}
            >
              {counts[tab.value]}
            </Badge>
          </TabsTrigger>
        ))}
      </TabsList>
    </Tabs>
  );
}