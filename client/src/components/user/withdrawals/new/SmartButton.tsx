// src/components/withdraw/smart-submit-button.tsx
'use client';

import { Button } from '@/components/ui/button';
import { ArrowRight, Loader2 } from 'lucide-react';
import type { WithdrawalFormData } from '@/types/withdrawal';
import type { InvestmentCycle, ShareholderInvestment } from '@/db/types';
import { formatCurrency, koboToNgn } from '@/lib/utils';

interface SmartSubmitButtonProps {
  formData: WithdrawalFormData;
  isValid: boolean;
  isSubmitting: boolean;
  onSubmit: () => void;
  completedCycles?: (InvestmentCycle & { investment?: ShareholderInvestment })[];
}

export function SmartSubmitButton({
  formData,
  isValid,
  isSubmitting,
  onSubmit,
  completedCycles = [],
}: SmartSubmitButtonProps) {
  // const formatCurrency = (value: string | bigint) => {
  //   const num = typeof value === 'bigint' ? Number(value) : parseFloat(value);
  //   if (isNaN(num)) return '₦0';
  //   return new Intl.NumberFormat('en-NG', {
  //     style: 'currency',
  //     currency: 'NGN',
  //     minimumFractionDigits: 0,
  //   }).format(num);
  // };

  const getWithdrawalAmount = (): string | bigint => {
    if (formData.source === 'wallet') {
      // Convert NGN to kobo (multiply by 100) so formatCurrency displays correctly
      const ngnAmount = parseFloat(formData.amount || '0');
      return BigInt(Math.round(ngnAmount * 100));
    }

    // For cycle divestment
    if (formData.cycleId && formData.divestmentType) {
      const selectedCycle = completedCycles.find((c) => c.id === formData.cycleId);
      const investment = selectedCycle?.investment;

      if (investment) {
        // --- THIS IS THE FIX ---
        // Handle the case where profitEarned might be null.
        // We use the nullish coalescing operator (??) to default to 0n (bigint zero).
        const profit = investment.profitEarned ?? 0n;

        if (formData.divestmentType === 'profit_only') {
          return profit;
        } else if (formData.divestmentType === 'full_divestment') {
          // We assume amountInvested is a non-null bigint
          return investment.amountInvested + profit;
        }
        // --- END FIX ---
      }
    }

    return '0';
  };

  const getButtonText = () => {
    if (isSubmitting) return 'Processing...';

    if (!isValid) {
      return 'Enter Details to Withdraw';
    }

    const amount = getWithdrawalAmount();
    const bank = formData.bankName || 'your bank';

    return `Withdraw ${formatCurrency(amount)} to ${bank}`;
  };

  return (
    <Button
      onClick={onSubmit}
      disabled={!isValid || isSubmitting}
      className="w-full h-14 text-lg font-semibold bg-gradient-to-r from-emerald-500 to-green-600 hover:from-emerald-600 hover:to-green-700 text-white shadow-lg hover:shadow-xl transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
    >
      {isSubmitting ? (
        <>
          <Loader2 className="h-5 w-5 mr-2 animate-spin" />
          Processing...
        </>
      ) : (
        <>
          {getButtonText()}
          {isValid && <ArrowRight className="h-5 w-5 ml-2" />}
        </>
      )}
    </Button>
  );
}