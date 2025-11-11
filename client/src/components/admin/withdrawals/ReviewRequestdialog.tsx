// src/components/admin/withdrawals/review-request-dialog.tsx
'use client';

import { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import {
  User,
  DollarSign,
  Building2,
  CreditCard,
  Wallet,
  AlertCircle,
  CheckCircle2,
  XCircle,
} from 'lucide-react';
import { formatCurrency } from '@/lib/utils';
import { toast } from 'sonner';
import type { WithdrawalWithUser } from '@/types/withdrawal';

interface ReviewRequestDialogProps {
  withdrawal: WithdrawalWithUser;
  open: boolean;
  onClose: () => void;
  onUpdate: () => void;
}

export function ReviewRequestDialog({
  withdrawal,
  open,
  onClose,
  onUpdate,
}: ReviewRequestDialogProps) {
  const [isProcessing, setIsProcessing] = useState(false);
  const [showRejectForm, setShowRejectForm] = useState(false);
  const [rejectionReason, setRejectionReason] = useState('');

  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat('en-NG', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    }).format(new Date(date));
  };

  const handleApprove = async () => {
    setIsProcessing(true);
    
    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 1500));

    toast.success('Withdrawal request approved!', {
      description: `${withdrawal.userName}'s request for ${formatCurrency(withdrawal.amount)} has been approved.`,
    });

    setIsProcessing(false);
    onUpdate();
    onClose();
  };

  const handleReject = async () => {
    if (!rejectionReason.trim()) {
      toast.error('Please provide a rejection reason');
      return;
    }

    setIsProcessing(true);
    
    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 1500));

    toast.success('Withdrawal request rejected', {
      description: `${withdrawal.userName} will be notified of the rejection.`,
    });

    setIsProcessing(false);
    setShowRejectForm(false);
    setRejectionReason('');
    onUpdate();
    onClose();
  };

  const handleMarkAsProcessed = async () => {
    setIsProcessing(true);
    
    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 1500));

    toast.success('Marked as processed!', {
      description: `${formatCurrency(withdrawal.amount)} has been sent to ${withdrawal.bankName}.`,
    });

    setIsProcessing(false);
    onUpdate();
    onClose();
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold">
            Review Payout Request #{withdrawal.id}
          </DialogTitle>
          <DialogDescription>
            Requested on {formatDate(withdrawal.requestedAt)}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Section 1: Request Summary */}
          <Card className="p-6 bg-gradient-to-br from-emerald-50 to-green-50 dark:from-emerald-950/20 dark:to-green-950/20 border-emerald-200 dark:border-emerald-800">
            <h3 className="font-semibold text-lg mb-4 flex items-center gap-2">
              <DollarSign className="h-5 w-5 text-emerald-600" />
              Request Summary
            </h3>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
                  <User className="h-4 w-4" />
                  <span className="font-medium">User</span>
                </div>
                <div className="text-right">
                  <p className="font-semibold text-gray-900 dark:text-white">
                    {withdrawal.userName}
                  </p>
                  <p className="text-sm text-gray-500">{withdrawal.userEmail}</p>
                </div>
              </div>

              <Separator />

              <div className="flex items-center justify-between">
                <span className="font-medium text-gray-600 dark:text-gray-400">Amount</span>
                <span className="text-2xl font-bold bg-gradient-to-r from-emerald-600 to-green-600 bg-clip-text text-transparent">
                  {formatCurrency(withdrawal.amount)}
                </span>
              </div>

              <Separator />

              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
                  <Wallet className="h-4 w-4" />
                  <span className="font-medium">Source</span>
                </div>
                <div className="text-right">
                  <Badge variant="outline" className="mb-1">
                    {withdrawal.withdrawalType === 'profit_only'
                      ? 'Profit Only'
                      : withdrawal.withdrawalType === 'full_divestment'
                      ? 'Full Divestment'
                      : 'Wallet Balance'}
                  </Badge>
                  {withdrawal.walletBalance !== undefined && (
                    <p className="text-sm text-gray-500">
                      Current Balance: {formatCurrency(withdrawal.walletBalance)}
                    </p>
                  )}
                </div>
              </div>
            </div>
          </Card>

          {/* Section 2: Payout Destination */}
          <Card className="p-6 border-2 border-amber-200 dark:border-amber-800 bg-amber-50/50 dark:bg-amber-950/20">
            <div className="flex items-center gap-2 mb-4">
              <AlertCircle className="h-5 w-5 text-amber-600" />
              <h3 className="font-semibold text-lg">Payout Destination (Critical)</h3>
            </div>
            <div className="space-y-4">
              <div className="flex items-start gap-3">
                <Building2 className="h-5 w-5 text-gray-400 mt-0.5" />
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                    Bank Name
                  </p>
                  <p className="text-lg font-bold text-gray-900 dark:text-white">
                    {withdrawal.bankName}
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <CreditCard className="h-5 w-5 text-gray-400 mt-0.5" />
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                    Account Number
                  </p>
                  <p className="text-lg font-bold text-gray-900 dark:text-white font-mono">
                    {withdrawal.accountNumber}
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <User className="h-5 w-5 text-gray-400 mt-0.5" />
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                    Account Name
                  </p>
                  <p className="text-lg font-bold text-gray-900 dark:text-white">
                    {withdrawal.accountName}
                  </p>
                </div>
              </div>

              <div className="bg-white dark:bg-gray-800 p-3 rounded-lg border border-amber-300 dark:border-amber-700">
                <p className="text-xs text-amber-700 dark:text-amber-400 flex items-start gap-2">
                  <AlertCircle className="h-4 w-4 flex-shrink-0 mt-0.5" />
                  <span>
                    Verify these details carefully before approving. In a production environment,
                    you would verify this account with a banking API.
                  </span>
                </p>
              </div>
            </div>
          </Card>

          {/* Rejection Reason Display */}
          {withdrawal.status === 'rejected' && withdrawal.rejectionReason && (
            <Card className="p-4 bg-red-50 dark:bg-red-950/20 border-red-200 dark:border-red-800">
              <h4 className="font-semibold text-red-900 dark:text-red-400 mb-2">
                Rejection Reason
              </h4>
              <p className="text-sm text-red-700 dark:text-red-300">
                {withdrawal.rejectionReason}
              </p>
            </Card>
          )}

          {/* Rejection Form */}
          {showRejectForm && (
            <Card className="p-4 border-red-200 dark:border-red-800">
              <Label htmlFor="rejectionReason" className="text-sm font-medium mb-2 block">
                Rejection Reason <span className="text-red-500">*</span>
              </Label>
              <Textarea
                id="rejectionReason"
                placeholder="Explain why this request is being rejected..."
                value={rejectionReason}
                onChange={(e) => setRejectionReason(e.target.value)}
                className="min-h-[100px]"
              />
            </Card>
          )}
        </div>

        <DialogFooter className="gap-2">
          {withdrawal.status === 'pending' && !showRejectForm && (
            <>
              <Button
                variant="outline"
                onClick={() => setShowRejectForm(true)}
                className="border-red-300 text-red-600 hover:bg-red-50 dark:border-red-800 dark:text-red-400 dark:hover:bg-red-950/20"
              >
                <XCircle className="h-4 w-4 mr-2" />
                Reject
              </Button>
              <Button
                onClick={handleApprove}
                disabled={isProcessing}
                className="bg-gradient-to-r from-emerald-500 to-green-600 hover:from-emerald-600 hover:to-green-700"
              >
                {isProcessing ? (
                  'Processing...'
                ) : (
                  <>
                    <CheckCircle2 className="h-4 w-4 mr-2" />
                    Approve Request
                  </>
                )}
              </Button>
            </>
          )}

          {showRejectForm && (
            <>
              <Button variant="outline" onClick={() => setShowRejectForm(false)}>
                Cancel
              </Button>
              <Button
                onClick={handleReject}
                disabled={isProcessing || !rejectionReason.trim()}
                className="bg-red-600 hover:bg-red-700 text-white"
              >
                {isProcessing ? 'Processing...' : 'Confirm Rejection'}
              </Button>
            </>
          )}

          {withdrawal.status === 'approved' && (
            <Button
              onClick={handleMarkAsProcessed}
              disabled={isProcessing}
              className="bg-gradient-to-r from-emerald-500 to-green-600 hover:from-emerald-600 hover:to-green-700"
            >
              {isProcessing ? (
                'Processing...'
              ) : (
                <>
                  <CheckCircle2 className="h-4 w-4 mr-2" />
                  Mark as Processed
                </>
              )}
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}