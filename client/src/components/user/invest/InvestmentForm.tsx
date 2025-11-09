"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Separator } from "@/components/ui/separator";
import { InvestmentCycle, Wallet } from "@/db";
import { formatCurrency, cn } from "@/lib/utils";
import { Minus, Plus, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

interface InvestmentFormProps {
  cycle: InvestmentCycle;
  wallet: Wallet;
}

// This defines the data structure we'll send to the "backend".
// It matches the fields needed to create a new `ShareholderInvestment`.
type InvestmentData = {
  userId: number;
  cycleId: number;
  shares: number;
  amountInvested: number;
};

/**
 * A simulated API function to submit the investment.
 * In a real-world app, this would be a Next.js Server Action or an API endpoint.
 */
async function submitInvestment(data: InvestmentData): Promise<{ success: boolean; message: string }> {
  console.log("Submitting investment to backend:", data);

  // Simulate network delay
  await new Promise(resolve => setTimeout(resolve, 1500));

  // In a real app, you would add logic here to write to your database.
  // For now, we'll just pretend it always succeeds.
  return { success: true, message: `Your investment of ${formatCurrency(data.amountInvested)} was successful.` };
}

export function InvestmentForm({ cycle, wallet }: InvestmentFormProps) {
  // FIX 1: Convert all incoming 'bigint' values to 'number' once.
  // This ensures all calculations within the component use the same type.
  const walletBalance = Number(wallet.balance);
  const pricePerShare = Number(cycle.pricePerShare ?? 10000);

  const [shares, setShares] = useState(0);
  const [agreed, setAgreed] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const router = useRouter();

  // FIX 2: All these calculations now use 'number' and are valid.
  const totalCost = shares * pricePerShare;
  const remainingBalance = walletBalance - totalCost;
  const hasSufficientFunds = remainingBalance >= 0;

  const isButtonDisabled = shares <= 0 || !hasSufficientFunds || !agreed || isSubmitting;

  const handleShareChange = (value: number) => {
    setShares(Math.max(0, value));
  };

  const handleMaxShares = () => {
    // FIX 3: This logic now works because all variables are 'number'.
    if (pricePerShare > 0) {
        const maxAffordableShares = Math.floor(walletBalance / pricePerShare);
        setShares(maxAffordableShares);
    }
  };

  /**
   * This is the main submission handler that replaces the old placeholder.
   */
  const handleInvest = async () => {
    setIsSubmitting(true);
    toast.loading("Processing your investment...");

    const investmentData: InvestmentData = {
      userId: wallet.userId,
      cycleId: cycle.id,
      shares: shares,
      amountInvested: totalCost, // This is now 'number', which matches the 'InvestmentData' type
    };

    const result = await submitInvestment(investmentData);

    toast.dismiss(); // Close the loading toast

    if (result.success) {
      toast.success("Investment Confirmed!", {
        description: result.message,
        duration: 5000,
      });
      // Redirect the user to their dashboard after the investment is successful.
      setTimeout(() => router.push('/admin/dashboard'), 2000);
    } else {
      toast.error("Investment Failed", {
        description: result.message || "An unexpected error occurred. Please try again.",
      });
      setIsSubmitting(false);
    }
  };

  return (
    <div className="grid grid-cols-1 gap-8 lg:grid-cols-2">
      {/* Left Column: Action Panel */}
      <div className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-base font-normal text-muted-foreground">Your Available Balance</CardTitle>
          </CardHeader>
          <CardContent>
            {/* FIX 4: Use the 'number' version of the balance */}
            <p className="text-3xl font-bold">{formatCurrency(walletBalance)}</p>
          </CardContent>
        </Card>

        <div className="space-y-2">
          <div className="flex justify-between items-baseline">
            <label htmlFor="shares" className="text-sm font-medium">Number of Shares</label>
            <Button variant="link" size="sm" className="p-0 h-auto" onClick={handleMaxShares}>Max</Button>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="icon" onClick={() => handleShareChange(shares - 1)} disabled={isSubmitting}><Minus className="h-4 w-4"/></Button>
            <Input
              id="shares"
              type="number"
              className="text-center"
              value={shares}
              onChange={(e) => handleShareChange(parseInt(e.target.value) || 0)}
              disabled={isSubmitting}
            />
            <Button variant="outline" size="icon" onClick={() => handleShareChange(shares + 1)} disabled={isSubmitting}><Plus className="h-4 w-4"/></Button>
          </div>
        </div>

        <div className="flex items-center space-x-2">
          <Checkbox id="terms" checked={agreed} onCheckedChange={(checked) => setAgreed(checked as boolean)} disabled={isSubmitting}/>
          <label htmlFor="terms" className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
            I understand my funds will be locked for the duration of this cycle.
          </label>
        </div>

        <Button size="lg" className="w-full" disabled={isButtonDisabled} onClick={handleInvest}>
          {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          {isSubmitting ? "Processing..." : "Confirm & Invest"}
        </Button>
      </div>

      {/* Right Column: Summary Panel */}
      <div>
        <Card>
          <CardHeader>
            <CardTitle>Investment Summary</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 text-sm">
            <div className="flex justify-between"><span>Cycle Name</span><span>{cycle.name}</span></div>
            {/* All 'formatCurrency' calls now use variables that are 'number's */}
            <div className="flex justify-between"><span>Price per Share</span><span>{formatCurrency(pricePerShare)}</span></div>
            <div className="flex justify-between"><span>Selected Shares</span><span>{shares}</span></div>
            <Separator />
            <div className="flex justify-between text-base font-semibold">
              <span>Total Cost</span>
              <span>{formatCurrency(totalCost)}</span>
            </div>
            <div className={cn("flex justify-between text-xs", hasSufficientFunds ? "text-muted-foreground" : "font-semibold text-red-500")}>
              <span>Remaining Balance</span>
              <span>{formatCurrency(remainingBalance)}</span>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}