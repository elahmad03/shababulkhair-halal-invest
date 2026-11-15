"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { formatCurrency, cn } from "@/lib/utils";
import { AlertCircle, CheckCircle } from "lucide-react";

interface InvestmentSummaryCardProps {
  pricePerShareKobo?: string | bigint | number;
  walletBalanceKobo?: string | bigint | number;
  pricePerShareNaira?: number;
  walletBalanceNaira?: number;
  shares: number;
  className?: string;
}

const InvestmentSummaryCard = ({
  pricePerShareKobo,
  walletBalanceKobo,
  pricePerShareNaira,
  walletBalanceNaira,
  shares,
  className,
}: InvestmentSummaryCardProps) => {
  const priceKobo =
    pricePerShareKobo != null
      ? BigInt(pricePerShareKobo.toString())
      : BigInt(Math.round((pricePerShareNaira ?? 10000) * 100));

  const walletKobo =
    walletBalanceKobo != null
      ? BigInt(walletBalanceKobo.toString())
      : BigInt(Math.round((walletBalanceNaira ?? 0) * 100));

  const totalInvestmentKobo = priceKobo * BigInt(shares);
  const remainingBalanceKobo = walletKobo - totalInvestmentKobo;
  const hasSufficientFunds = remainingBalanceKobo >= 0n;
  const feesKobo = 0n;

  return (
    <Card className={cn("shadow-lg", className)}>
      <CardHeader>
        <CardTitle className="text-xl sm:text-2xl">Order Summary</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Shares */}
        <div className="flex justify-between items-center">
          <span className="text-sm text-muted-foreground">Number of Shares</span>
          <span className="font-semibold">{shares}</span>
        </div>

        {/* Price per share */}
        <div className="flex justify-between items-center">
          <span className="text-sm text-muted-foreground">Price per Share</span>
          <span className="font-semibold">{formatCurrency(priceKobo)}</span>
        </div>

        <Separator />

        {/* Subtotal */}
        <div className="flex justify-between items-center">
          <span className="text-sm text-muted-foreground">Subtotal</span>
          <span className="font-semibold">{formatCurrency(totalInvestmentKobo)}</span>
        </div>

        {/* Fees */}
        <div className="flex justify-between items-center">
          <span className="text-sm text-muted-foreground">Transaction Fees</span>
          <span className="font-semibold text-primary">{formatCurrency(feesKobo)}</span>
        </div>

        <Separator />

        {/* Total */}
        <div className="flex justify-between items-center">
          <span className="font-semibold">Total Investment</span>
          <span className="text-xl font-bold text-primary">
            {formatCurrency(totalInvestmentKobo)}
          </span>
        </div>

        <Separator className="my-4" />

        {/* Wallet Balance */}
        <div className="space-y-3">
          <div className="flex justify-between items-center">
            <span className="text-sm text-muted-foreground">Current Balance</span>
            <span className="font-semibold">{formatCurrency(walletKobo)}</span>
          </div>

          {/* Remaining Balance */}
          <div className="flex justify-between items-center">
            <span className="text-sm font-medium">Remaining Balance</span>
            <span
              className={cn(
                "font-bold text-lg",
                hasSufficientFunds
                  ? "text-primary"
                  : "text-destructive"
              )}
            >
              {formatCurrency(remainingBalanceKobo)}
            </span>
          </div>

          {/* Status Indicator */}
          {shares > 0 && (
            <div
              className={cn(
                "flex items-center gap-2 p-3 rounded-lg",
                hasSufficientFunds
                  ? "bg-muted/50 text-primary"
                  : "bg-destructive/10 text-destructive"
              )}
            >
              {hasSufficientFunds ? (
                <>
                  <CheckCircle className="h-5 w-5 flex-shrink-0" />
                  <span className="text-sm font-medium">
                    Sufficient funds available
                  </span>
                </>
              ) : (
                <>
                  <AlertCircle className="h-5 w-5 flex-shrink-0" />
                  <span className="text-sm font-medium">
                    Insufficient funds in wallet
                  </span>
                </>
              )}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default InvestmentSummaryCard;
