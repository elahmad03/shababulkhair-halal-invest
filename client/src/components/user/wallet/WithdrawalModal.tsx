"use client";

import { useState } from "react";
import { v4 as uuidv4 } from "uuid";
import { useRequestWithdrawalMutation } from "@/store/modules/wallet/walletApi";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner"; 
import { Loader2, Banknote } from "lucide-react";

interface WithdrawModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  maxAmount: number;
}

export default function WithdrawModal({ open, onOpenChange, maxAmount }: WithdrawModalProps) {
  const [amount, setAmount] = useState("");
  const [bankName, setBankName] = useState("");
  const [accountNumber, setAccountNumber] = useState("");
  const [accountName, setAccountName] = useState("");
  
  const [requestWithdrawal, { isLoading }] = useRequestWithdrawalMutation();

  const handleWithdraw = async (e: React.FormEvent) => {
    e.preventDefault();
    const numAmount = parseFloat(amount);
    
    if (numAmount > maxAmount) {
      return toast.error("Insufficient Balance", {
        description: "You cannot withdraw more than your available balance.",
      });
    }

    try {
      const idempotencyKey = uuidv4();

      await requestWithdrawal({ 
        amount: numAmount,
        bankName,
        accountNumber,
        accountName,
        idempotencyKey
      }).unwrap();
      
      // 🔥 Sonner Success Toast
      toast.success("Withdrawal Queued Successfully", { 
        description: `₦${numAmount.toLocaleString()} has been locked and is pending admin processing.`,
      });
      
      onOpenChange(false);
      setAmount(""); setBankName(""); setAccountNumber(""); setAccountName("");
      
    } catch (err: any) {
      // 🔥 Sonner Error Toast
      toast.error("Request Failed", { 
        description: err?.data?.message || "Could not process withdrawal. Please try again.",
      });
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader className="space-y-3">
          <div className="h-12 w-12 bg-primary/10 rounded-full flex items-center justify-center">
            <Banknote className="h-6 w-6 text-primary" />
          </div>
          <div className="space-y-1">
            <DialogTitle className="text-xl">Withdraw Funds</DialogTitle>
            <DialogDescription>
              Transfers are processed manually by our finance team to ensure security. Expected SLA: 2-24 hours.
            </DialogDescription>
          </div>
        </DialogHeader>
        
        <form onSubmit={handleWithdraw} className="space-y-5 mt-4">
          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <Label htmlFor="w-amount">Amount (₦)</Label>
              <span className="text-xs font-medium text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full">
                Max: ₦{maxAmount.toLocaleString()}
              </span>
            </div>
            <Input 
              id="w-amount" 
              type="number" 
              placeholder="0.00"
              max={maxAmount}
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              disabled={isLoading}
              className="text-lg font-semibold"
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2 col-span-2 sm:col-span-1">
              <Label htmlFor="bankName">Bank Name</Label>
              <Input id="bankName" placeholder="e.g. GTBank" value={bankName} onChange={(e) => setBankName(e.target.value)} required disabled={isLoading}/>
            </div>

            <div className="space-y-2 col-span-2 sm:col-span-1">
              <Label htmlFor="accountNumber">Account Number</Label>
              <Input id="accountNumber" placeholder="0123456789" maxLength={10} value={accountNumber} onChange={(e) => setAccountNumber(e.target.value)} required disabled={isLoading}/>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="accountName">Account Name</Label>
            <Input id="accountName" placeholder="John Doe" value={accountName} onChange={(e) => setAccountName(e.target.value)} required disabled={isLoading}/>
          </div>
          
          <div className="pt-2">
            <Button type="submit" className="w-full h-11 text-base font-medium" disabled={isLoading}>
              {isLoading ? <Loader2 className="w-5 h-5 mr-2 animate-spin" /> : null}
              {isLoading ? "Processing Request..." : "Confirm Withdrawal"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}