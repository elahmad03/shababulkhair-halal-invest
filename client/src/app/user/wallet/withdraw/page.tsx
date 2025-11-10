// src/app/(user)/withdraw/page.tsx
'use client';

import { useState } from 'react';
import { ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { SourceSelector } from '@/components/user/withdrawals/new/SourceSelector';
import { WalletAmountInput } from '@/components/user/withdrawals/new/WalletAmountInput';
import { CycleDivestSelector } from '@/components/user/withdrawals/new/CycleDiveSelector';
import { BankDetailsForm } from '@/components/user/withdrawals/new/BankDetailsForm';
import { SmartSubmitButton } from '@/components/user/withdrawals/new/SmartButton';
import { WithdrawalHistory } from '@/components/user/withdrawals/new/WithdrawalHistory';
import { mockData } from '@/db/';
import type { WithdrawalFormData, WithdrawalSource, DivestmentType } from '@/types/withdrawal';
import { toast } from 'sonner';

export default function WithdrawPage() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState<WithdrawalFormData>({
    source: 'wallet',
    amount: '',
    bankName: '',
    accountNumber: '',
    accountName: '',
  });

  // Mock current user ID (in production, get from auth session)
  const currentUserId = 2;

  // Get user's wallet
  const userWallet = mockData.wallets.find((w) => w.userId === currentUserId);
  const walletBalance = userWallet?.balance || 0n;

  // Get user's completed investments
  const userInvestments = mockData.shareholderInvestments.filter(
    (inv) => inv.userId === currentUserId
  );
  
  const completedCycles = mockData.investmentCycles
    .filter((cycle) => cycle.status === 'completed')
    .map((cycle) => ({
      ...cycle,
      investment: userInvestments.find((inv) => inv.cycleId === cycle.id),
    }))
    .filter((cycle) => cycle.investment);

  // Get withdrawal history
  const withdrawalHistory = mockData.withdrawalRequests.filter(
    (req) => req.userId === currentUserId
  );

  const handleSourceChange = (source: WithdrawalSource) => {
    setFormData((prev) => ({
      ...prev,
      source,
      amount: '',
      cycleId: undefined,
      divestmentType: undefined,
    }));
  };

  const handleFieldChange = (
    field: keyof WithdrawalFormData,
    value: string | number | DivestmentType
  ) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const validateForm = (): boolean => {
    if (!formData.bankName.trim()) return false;
    if (formData.accountNumber.length !== 10) return false;
    if (!formData.accountName.trim()) return false;

    if (formData.source === 'wallet') {
      const amount = parseFloat(formData.amount);
      if (isNaN(amount) || amount <= 0) return false;
      if (BigInt(amount) > walletBalance) return false;
    } else {
      if (!formData.cycleId || !formData.divestmentType) return false;
    }

    return true;
  };

  const handleSubmit = async () => {
    if (!validateForm()) return;

    setIsSubmitting(true);
    
    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 2000));

    toast.success('Withdrawal request submitted successfully!', {
      description: 'Your request will be processed within 24-48 hours.',
    });

    // Reset form
    setFormData({
      source: 'wallet',
      amount: '',
      bankName: '',
      accountNumber: '',
      accountName: '',
    });

    setIsSubmitting(false);
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="container mx-auto px-4 py-8 max-w-7xl">
        {/* Header */}
        <div className="mb-8">
          <Link href="/dashboard">
            <Button variant="ghost" className="mb-4 -ml-2">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Dashboard
            </Button>
          </Link>
          <h1 className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-emerald-600 to-green-600 bg-clip-text text-transparent">
            Withdraw Funds
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-2">
            Request a payout to your bank account
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Form - Left/Top */}
          <div className="lg:col-span-2 space-y-6">
            {/* Step 1: Source */}
            <SourceSelector value={formData.source} onChange={handleSourceChange} />

            {/* Step 2: Amount */}
            {formData.source === 'wallet' ? (
              <WalletAmountInput
                balance={walletBalance}
                amount={formData.amount}
                onChange={(amount) => handleFieldChange('amount', amount)}
              />
            ) : (
              <CycleDivestSelector
                completedCycles={completedCycles}
                selectedCycleId={formData.cycleId}
                divestmentType={formData.divestmentType}
                onCycleChange={(cycleId) => handleFieldChange('cycleId', cycleId)}
                onDivestmentTypeChange={(type) => handleFieldChange('divestmentType', type)}
              />
            )}

            {/* Step 3: Bank Details */}
            <BankDetailsForm
              bankName={formData.bankName}
              accountNumber={formData.accountNumber}
              accountName={formData.accountName}
              onChange={handleFieldChange}
            />

            {/* Step 4: Submit */}
            <SmartSubmitButton
              formData={formData}
              isValid={validateForm()}
              isSubmitting={isSubmitting}
              onSubmit={handleSubmit}
            />
          </div>

          {/* History - Right/Bottom */}
          <div className="lg:col-span-1">
            <WithdrawalHistory withdrawals={withdrawalHistory} />
          </div>
        </div>
      </div>
    </div>
  );
}