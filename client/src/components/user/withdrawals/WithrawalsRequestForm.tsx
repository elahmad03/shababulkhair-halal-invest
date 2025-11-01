"use client";

import { useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ShareholderInvestment } from "@/schemas/app";
import { formatCurrency } from "@/lib/utils";

// Define a type for the completed investments prop for clarity
type CompletedInvestment = ShareholderInvestment & { cycleName: string };

interface WithdrawalRequestFormProps {
  // Keep wallet balance in kobo (bigint) to match DB schema
  walletBalance: bigint;
  completedInvestments: CompletedInvestment[];
}

export function WithdrawalRequestForm({
  walletBalance,
  completedInvestments,
}: WithdrawalRequestFormProps) {
  const [source, setSource] = useState<"wallet" | "investment" | undefined>();
  const [amount, setAmount] = useState("");
  const [selectedCycleId, setSelectedCycleId] = useState<string>("");
  const [divestmentType, setDivestmentType] = useState<"profit" | "full" | undefined>();

  const selectedInvestment = completedInvestments.find(
    (inv) => inv.id.toString() === selectedCycleId
  );

  // Return amounts as kobo bigint to align with DB schema
  const getWithdrawalAmount = (): bigint => {
    if (source === "wallet") {
      // parse user input as NGN (may include decimals), convert to kobo
      const parsed = parseFloat(amount || "0");
      const kobo = Math.round(parsed * 100);
      return BigInt(kobo);
    }
    if (source === "investment" && selectedInvestment) {
      if (divestmentType === "profit") return selectedInvestment.profitEarned;
      if (divestmentType === "full")
        return selectedInvestment.amountInvested + selectedInvestment.profitEarned;
    }
    return 0n;
  };

  const finalAmount = getWithdrawalAmount();
  const formattedWalletBalance = formatCurrency(walletBalance);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const requestDetails = {
      source,
      amount: finalAmount,
      cycleId: source === "investment" ? selectedCycleId : null,
      divestmentType: source === "investment" ? divestmentType : null,
    };
    console.log("Submitting withdrawal request:", requestDetails);
    // Here you would typically call an API to submit the request
    alert(`Request for ${new Intl.NumberFormat("en-NG", { style: "currency", currency: "NGN" }).format(finalAmount)} submitted!`);
  };

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle className="text-2xl font-bold">Request a Withdrawal</CardTitle>
        <CardDescription>
          Follow the steps below to withdraw funds from your account.
        </CardDescription>
      </CardHeader>
      <form onSubmit={handleSubmit}>
        <CardContent className="space-y-6">
          {/* Step 1: Choose Source */}
          <div className="space-y-2">
            <Label className="text-base font-semibold">Step 1: Choose Withdrawal Source</Label>
            <RadioGroup onValueChange={(value: "wallet" | "investment") => setSource(value)} value={source}>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="wallet" id="wallet" />
                <Label htmlFor="wallet">From my Wallet Balance</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="investment" id="investment" />
                <Label htmlFor="investment">From a Completed Investment Cycle</Label>
              </div>
            </RadioGroup>
          </div>

          {/* Step 2: Specify Amount (Conditional) */}
          {source && (
            <div className="space-y-2">
              <Label className="text-base font-semibold">Step 2: Specify Amount</Label>
              {source === "wallet" && (
                <div className="space-y-2">
                  <Input
                    type="number"
                    placeholder="e.g., 50000"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                  />
                  <p className="text-sm text-muted-foreground">
                    Available: <strong>{formattedWalletBalance}</strong>
                  </p>
                </div>
              )}

              {source === "investment" && (
                <div className="space-y-4">
                  <Select onValueChange={setSelectedCycleId} value={selectedCycleId}>
                    <SelectTrigger>
                      <SelectValue placeholder="Choose a completed cycle" />
                    </SelectTrigger>
                    <SelectContent>
                      {completedInvestments.map((inv) => (
                        <SelectItem key={inv.id} value={inv.id.toString()}>
                          {inv.cycleName}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>

                  {selectedInvestment && (
                    <RadioGroup
                      onValueChange={(value: "profit" | "full") => setDivestmentType(value)}
                      value={divestmentType}
                    >
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="profit" id="profit" />
                        <Label htmlFor="profit">
                          Profit Only ({formatCurrency(selectedInvestment.profitEarned)})
                        </Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="full" id="full" />
                        <Label htmlFor="full">
                          Full Divestment (Capital + Profit) ({formatCurrency(selectedInvestment.amountInvested + selectedInvestment.profitEarned)})
                        </Label>
                      </div>
                    </RadioGroup>
                  )}
                </div>
              )}
            </div>
          )}
        </CardContent>
        
        {/* Step 3: Confirmation & Submission */}
        <CardFooter className="flex flex-col items-start gap-4">
          {finalAmount > 0n && (
            <p className="text-lg">
              You are about to request a withdrawal of {" "}
              <strong>{formatCurrency(finalAmount)}.</strong>
            </p>
          )}
          <Button
            type="submit"
            size="lg"
            className="w-full font-semibold text-white bg-gradient-to-r from-emerald-500 to-green-600 hover:from-emerald-600 hover:to-green-700"
            disabled={finalAmount <= 0n}
          >
            Submit Request
          </Button>
        </CardFooter>
      </form>
    </Card>
  );
}