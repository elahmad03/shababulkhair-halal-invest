// src/components/withdraw/bank-details-form.tsx
'use client';

import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Building2, CreditCard, User } from 'lucide-react';

interface BankDetailsFormProps {
  bankName: string;
  accountNumber: string;
  accountName: string;
  onChange: (field: 'bankName' | 'accountNumber' | 'accountName', value: string) => void;
}

export function BankDetailsForm({
  bankName,
  accountNumber,
  accountName,
  onChange,
}: BankDetailsFormProps) {
  return (
    <Card className="p-6">
      <div className="space-y-4">
        <div>
          <h3 className="font-semibold text-lg mb-4 flex items-center gap-2">
            <Building2 className="h-5 w-5 text-emerald-600" />
            Bank Account Details
          </h3>
        </div>

        <div className="space-y-2">
          <Label htmlFor="bankName" className="text-sm font-medium">
            Bank Name
          </Label>
          <Input
            id="bankName"
            placeholder="e.g., GTBank, First Bank, Access Bank"
            value={bankName}
            onChange={(e) => onChange('bankName', e.target.value)}
            className="h-12"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="accountNumber" className="text-sm font-medium">
            Account Number
          </Label>
          <div className="relative">
            <CreditCard className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              id="accountNumber"
              placeholder="10-digit account number"
              maxLength={10}
              value={accountNumber}
              onChange={(e) => onChange('accountNumber', e.target.value.replace(/\D/g, ''))}
              className="pl-10 h-12"
            />
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="accountName" className="text-sm font-medium">
            Account Name
          </Label>
          <div className="relative">
            <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              id="accountName"
              placeholder="Must match your registered name"
              value={accountName}
              onChange={(e) => onChange('accountName', e.target.value)}
              className="pl-10 h-12"
            />
          </div>
          <p className="text-xs text-gray-500">
            For security, this must match your registered account name
          </p>
        </div>
      </div>
    </Card>
  );
}