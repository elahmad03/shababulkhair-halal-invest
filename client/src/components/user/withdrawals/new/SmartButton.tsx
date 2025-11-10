
'use client';

import { Button } from '@/components/ui/button';
import { ArrowRight, Loader2 } from 'lucide-react';
import type { WithdrawalFormData } from '@/types/withdrawal';

interface SmartSubmitButtonProps {
  formData: WithdrawalFormData;
  isValid: boolean;
  isSubmitting: boolean;
  onSubmit: () => void;
}

export function SmartSubmitButton({
  formData,
  isValid,
  isSubmitting,
  onSubmit,
}: SmartSubmitButtonProps) {
  const formatCurrency = (value: string) => {
    const num = parseFloat(value);
    if (isNaN(num)) return '₦0';
    return new Intl.NumberFormat('en-NG', {
      style: 'currency',
      currency: 'NGN',
      minimumFractionDigits: 0,
    }).format(num);
  };

  const getButtonText = () => {
    if (isSubmitting) return 'Processing...';
    
    if (!isValid) {
      return 'Enter Details to Withdraw';
    }

    const amount = formData.amount || '0';
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