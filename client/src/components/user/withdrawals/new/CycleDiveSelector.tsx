// src/components/withdraw/cycle-divest-selector.tsx
'use client';

import { Card } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import type { InvestmentCycle, ShareholderInvestment } from '@/db/types';
import { formatCurrency } from '@/lib/utils';
import type { DivestmentType } from '@/types/withdrawal';

interface CycleDivestSelectorProps {
  completedCycles: (InvestmentCycle & { investment?: ShareholderInvestment })[];
  selectedCycleId?: number;
  divestmentType?: DivestmentType;
  onCycleChange: (cycleId: number) => void;
  onDivestmentTypeChange: (type: DivestmentType) => void;
}

export function CycleDivestSelector({
  completedCycles,
  selectedCycleId,
  divestmentType,
  onCycleChange,
  onDivestmentTypeChange,
}: CycleDivestSelectorProps) {
  const selectedCycle = completedCycles.find((c) => c.id === selectedCycleId);
  const investment = selectedCycle?.investment;

  return (
    <Card className="p-6 space-y-6">
      {/* Cycle Selector */}
      <div className="space-y-2">
        <Label htmlFor="cycle" className="text-sm font-medium">
          Choose a Completed Cycle
        </Label>
        <Select
          value={selectedCycleId?.toString()}
          onValueChange={(value) => onCycleChange(Number(value))}
        >
          <SelectTrigger id="cycle" className="h-12">
            <SelectValue placeholder="Select a cycle..." />
          </SelectTrigger>
          <SelectContent>
            {completedCycles.map((cycle) => (
              <SelectItem key={cycle.id} value={cycle.id.toString()}>
                <div className="flex items-center justify-between gap-4">
                  <span className="font-medium">{cycle.name}</span>
                  {cycle.investment && (
                    <span className="text-sm text-gray-500">
                      {cycle.investment.shares} shares
                    </span>
                  )}
                </div>
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Divestment Type Section */}
      {selectedCycleId && investment && (
        <div className="space-y-4">
          <Label className="text-sm font-medium">Divestment Type</Label>
          <RadioGroup
            value={divestmentType}
            onValueChange={(v) => onDivestmentTypeChange(v as DivestmentType)}
            className="space-y-3"
          >
            {/* Profit Only Option */}
            <div className="flex items-start space-x-3 p-4 rounded-lg border-2 border-gray-200 dark:border-gray-700 hover:border-emerald-300 dark:hover:border-emerald-700 transition-colors has-[:checked]:border-emerald-500 has-[:checked]:bg-emerald-50 dark:has-[:checked]:bg-emerald-950/20">
              <RadioGroupItem value="profit_only" id="profit_only" className="mt-0.5" />
              <div className="flex-1 space-y-1">
                <Label htmlFor="profit_only" className="font-medium cursor-pointer">
                  Withdraw Profit Only
                </Label>
                <p className="text-sm text-gray-500">
                  Keep your capital invested for future cycles
                </p>
                <p className="text-lg font-bold text-emerald-600">
                  {formatCurrency(investment.profitEarned ?? 0n)}
                </p>
              </div>
            </div>

            {/* Full Divestment Option */}
            <div className="flex items-start space-x-3 p-4 rounded-lg border-2 border-gray-200 dark:border-gray-700 hover:border-emerald-300 dark:hover:border-emerald-700 transition-colors has-[:checked]:border-emerald-500 has-[:checked]:bg-emerald-50 dark:has-[:checked]:bg-emerald-950/20">
              <RadioGroupItem value="full_divestment" id="full_divestment" className="mt-0.5" />
              <div className="flex-1 space-y-1">
                <Label htmlFor="full_divestment" className="font-medium cursor-pointer">
                  Full Divestment - Capital + Profit
                </Label>
                <p className="text-sm text-gray-500">
                  Withdraw all funds from this cycle
                </p>
                <p className="text-lg font-bold text-emerald-600">
                  {formatCurrency((investment.amountInvested ?? 0n) + (investment.profitEarned ?? 0n))}
                </p>
              </div>
            </div>
          </RadioGroup>
        </div>
      )}
    </Card>
  );
}
