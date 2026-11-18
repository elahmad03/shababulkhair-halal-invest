"use client";

import { useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { ArrowLeft, Wallet as WalletIcon, Loader2 } from "lucide-react";
import { formatCurrency } from "@/lib/utils";
import { toast } from "sonner";
import type { Cycle } from "@/store/modules/cycle/cycle.types";
import type { WalletBalance as Wallet } from "@/store/modules/wallet/Wallet.types";
import ShareCounter from "./ShareCounter";
import InvestmentSummaryCard from "./InvestmentSummaryCard";
import { usePurchaseSharesMutation } from "@/store/modules/cycle/cycleApi";

interface InvestmentCheckoutFormProps {
  cycle: Cycle;
  wallet: Wallet;
}

const InvestmentCheckoutForm = ({ cycle, wallet }: InvestmentCheckoutFormProps) => {
  const router = useRouter();
  const [purchaseShares, { isLoading: isPurchasing }] = usePurchaseSharesMutation();
  const [shares, setShares] = useState(0);
  const [termsAccepted, setTermsAccepted] = useState(false);

  // Retain the idempotency key across uncertain network failures / retries for the same order intent
  const idempotencyKeyRef = useRef<string>(
    `invest-${cycle.id}-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`
  );

  const handleSharesChange = (newShares: number) => {
    setShares(newShares);
    // Regenerate key when share quantity changes (new purchase intent)
    idempotencyKeyRef.current = `invest-${cycle.id}-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
  };

  // Financial calculations entirely in Kobo using BigInt with backwards compatibility for legacy callers:
  // 1. If pricePerShareKobo is provided, use it directly.
  // 2. Otherwise if pricePerShareNaira or legacy pricePerShare is provided, convert from Naira to Kobo (* 100).
  // 3. Fallback to 1,000,000 Kobo (₦10,000).
  const pricePerShareKobo: bigint = (() => {
    if (cycle.pricePerShareKobo != null) {
      return BigInt(cycle.pricePerShareKobo.toString().split(".")[0] || "0");
    }
    const legacyNaira = (cycle as any).pricePerShareNaira ?? (cycle as any).pricePerShare;
    if (legacyNaira != null) {
      return BigInt(Math.round(Number(legacyNaira) * 100));
    }
    return 1000000n;
  })();

  const totalInvestmentKobo = pricePerShareKobo * BigInt(shares);

  // 1. If wallet.balanceKobo is provided, use it directly.
  // 2. Otherwise if balanceNaira or legacy balance is provided, convert from Naira to Kobo (* 100).
  // 3. Fallback to 0n.
  const walletBalanceKobo: bigint = (() => {
    if (wallet.balanceKobo != null) {
      return BigInt(wallet.balanceKobo.toString().split(".")[0] || "0");
    }
    const legacyBalance = (wallet as any).balanceNaira ?? (wallet as any).balance;
    if (legacyBalance != null) {
      return BigInt(Math.round(Number(legacyBalance) * 100));
    }
    return 0n;
  })();
  const remainingBalanceKobo = walletBalanceKobo - totalInvestmentKobo;
  const hasSufficientFunds = remainingBalanceKobo >= 0n;
  const canSubmit = shares > 0 && hasSufficientFunds && termsAccepted && !isPurchasing;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!canSubmit) return;

    // Retain the exact same key across uncertain network failures so the server deduplicates
    const idempotencyKey = idempotencyKeyRef.current;

    try {
      await purchaseShares({
        cycleId: cycle.id,
        body: {
          sharesRequested: shares,
          idempotencyKey,
        },
      }).unwrap();

      toast.success("Investment Successful!", {
        description: `You've invested ${formatCurrency(totalInvestmentKobo)} in ${cycle.cycleName || (cycle as any).name || "Investment Cycle"}`,
      });

      // Refresh key for future purchase
      idempotencyKeyRef.current = `invest-${cycle.id}-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;

      router.push("/user/dashboard");
    } catch (error: any) {
      toast.error("Investment Failed", {
        description: error?.data?.message || "Something went wrong. Please try again.",
      });
      // DO NOT regenerate idempotencyKeyRef on failure:
      // If the server committed the transaction but the client timed out waiting for the response,
      // re-submitting with this retained key will safely return the existing purchase without a double-debit.
    }
  };

  return (
    <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
      {/* Back Button */}
      <Button
        variant="ghost"
        onClick={() => router.back()}
        className="mb-6 hover:bg-muted"
      >
        <ArrowLeft className="mr-2 h-4 w-4" />
        Back to Cycle Details
      </Button>

      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl sm:text-4xl font-bold mb-2">
          Invest in {cycle.cycleName || (cycle as any).name || "Investment Cycle"}
        </h1>
        <p className="text-muted-foreground">
          Secure your shares at {formatCurrency(pricePerShareKobo)} per share
        </p>
      </div>

      <form onSubmit={handleSubmit}>
        {/* Two Column Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8">
          {/* Left Column - Input Section */}
          <div className="lg:col-span-7 space-y-6">
            {/* Wallet Context Card */}
            <Card className="border-primary/20 bg-primary/5">
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="h-12 w-12 rounded-full bg-primary flex items-center justify-center">
                      <WalletIcon className="h-6 w-6 text-primary-foreground" />
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">
                        Available to Invest
                      </p>
                      <p className="text-2xl font-bold text-primary">
                        {formatCurrency(walletBalanceKobo)}
                      </p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Share Selection Card */}
            <Card>
              <CardHeader>
                <CardTitle className="text-xl sm:text-2xl">
                  How many shares?
                </CardTitle>
                <p className="text-sm text-muted-foreground">
                  {formatCurrency(pricePerShareKobo)} per share
                </p>
              </CardHeader>
              <CardContent className="pt-8 pb-10">
                <ShareCounter shares={shares} onSharesChange={handleSharesChange} />
              </CardContent>
            </Card>

            {/* Mobile Summary (shown only on mobile) */}
            <div className="lg:hidden">
              <InvestmentSummaryCard
                pricePerShareKobo={pricePerShareKobo}
                shares={shares}
                walletBalanceKobo={walletBalanceKobo}
              />
            </div>

            {/* Terms & Conditions */}
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-start gap-3">
                  <Checkbox
                    id="terms"
                    checked={termsAccepted}
                    onCheckedChange={(checked) =>
                      setTermsAccepted(checked as boolean)
                    }
                    className="mt-1"
                  />
                  <div className="flex-1">
                    <Label
                      htmlFor="terms"
                      className="text-sm font-medium leading-relaxed cursor-pointer"
                    >
                      I understand and agree that these funds will be locked until
                      the cycle reaches maturity on{" "}
                      {(cycle.activeEndsAt || cycle.fundingClosesAt) &&
                        new Date(cycle.activeEndsAt || cycle.fundingClosesAt!).toLocaleDateString("en-US", {
                          month: "long",
                          day: "numeric",
                          year: "numeric",
                        })}
                      . I acknowledge the risks associated with this investment.
                    </Label>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Submit Button (Mobile) */}
            <div className="lg:hidden sticky bottom-0 bg-background pt-4 pb-6 -mx-4 px-4 border-t border-border">
              <Button
                type="submit"
                disabled={!canSubmit}
                className="w-full h-14 text-lg font-semibold bg-primary hover:bg-primary/90 text-primary-foreground disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isPurchasing ? (
                  <>
                    <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                    Processing...
                  </>
                ) : (
                  <>
                    CONFIRM INVESTMENT
                    {shares > 0 && ` (${formatCurrency(totalInvestmentKobo)})`}
                  </>
                )}
              </Button>
              {!canSubmit && shares > 0 && (
                <p className="text-xs text-center text-destructive mt-2">
                  {!hasSufficientFunds
                    ? "Insufficient funds in wallet"
                    : !termsAccepted
                    ? "Please accept the terms and conditions"
                    : "Please select at least one share"}
                </p>
              )}
            </div>
          </div>

          {/* Right Column - Sticky Summary (Desktop Only) */}
          <div className="hidden lg:block lg:col-span-5">
            <div className="sticky top-6 space-y-6">
              <InvestmentSummaryCard
                pricePerShareKobo={pricePerShareKobo}
                shares={shares}
                walletBalanceKobo={walletBalanceKobo}
              />

              <Button
                type="submit"
                disabled={!canSubmit}
                className="w-full h-14 text-lg font-semibold bg-primary hover:bg-primary/90 text-primary-foreground disabled:opacity-50 disabled:cursor-not-allowed shadow-lg"
              >
                {isPurchasing ? (
                  <>
                    <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                    Processing...
                  </>
                ) : (
                  <>
                    CONFIRM INVESTMENT
                    {shares > 0 && ` (${formatCurrency(totalInvestmentKobo)})`}
                  </>
                )}
              </Button>

              {!canSubmit && shares > 0 && (
                <p className="text-xs text-center text-destructive">
                  {!hasSufficientFunds
                    ? "Insufficient funds in wallet"
                    : !termsAccepted
                    ? "Please accept the terms and conditions"
                    : "Please select at least one share"}
                </p>
              )}
            </div>
          </div>
        </div>
      </form>
    </div>
  );
};

export default InvestmentCheckoutForm;
