"use client";

import { useState } from "react";
import { useInitializeDepositMutation } from "@/store/modules/wallet/walletApi";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast, Toaster } from "sonner";
import { Loader2 } from "lucide-react";

export default function DepositModal({ open, onOpenChange }: { open: boolean, onOpenChange: (open: boolean) => void }) {
  const [amount, setAmount] = useState("");
  const [initializeDeposit, { isLoading }] = useInitializeDepositMutation();
 
  const handleDeposit = async (e: React.FormEvent) => {
    e.preventDefault();
    const numAmount = parseFloat(amount);
    
    if (!numAmount || numAmount < 1000) {
      return toast.error("Invalid Amount",{ 
        description: "Minimum deposit is ₦1,000", 
 }
      );
    }

    try {
      const res = await initializeDeposit({ amount: numAmount }).unwrap();
      
      if (res.success && res.data.authorizationUrl) {
        // Redirect to Paystack/Flutterwave checkout page
        window.location.href = res.data.authorizationUrl;
      }
    } catch (err: any) {
      toast.error("Deposit Failed", { 
        description: "Could not process deposit. Please try again."
      });
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Deposit Funds</DialogTitle>
          <DialogDescription>
            Enter the amount you wish to add to your wallet. You will be redirected to our secure payment gateway.
          </DialogDescription>
        </DialogHeader>
        
        <form onSubmit={handleDeposit} className="space-y-6 mt-4">
          <div className="space-y-2">
            <Label htmlFor="amount">Amount (₦)</Label>
            <Input 
              id="amount" 
              type="number" 
              placeholder="e.g. 50000" 
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              disabled={isLoading}
              min="1000"
            />
          </div>
          
          <Button type="submit" className="w-full" disabled={isLoading}>
            {isLoading ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : null}
            {isLoading ? "Initializing..." : "Proceed to Payment"}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}