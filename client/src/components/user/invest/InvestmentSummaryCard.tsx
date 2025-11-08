"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { formatCurrency } from "@/lib/utils"
import { AlertCircle, CheckCircle } from "lucide-react"
import { cn } from "@/lib/utils"

interface InvestmentSummaryCardProps {
  pricePerShare: bigint
  shares: number
  walletBalance: bigint
  className?: string
}

const InvestmentSummaryCard = ({
  pricePerShare,
  shares,
  walletBalance,
  className,
}: InvestmentSummaryCardProps) => {
  const totalInvestment = pricePerShare * BigInt(shares)
  const remainingBalance = walletBalance - totalInvestment
  const hasSufficientFunds = remainingBalance >= 0n
  const fees = 0n // No fees for now

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
          <span className="font-semibold">{formatCurrency(pricePerShare)}</span>
        </div>

        <Separator />

        {/* Subtotal */}
        <div className="flex justify-between items-center">
          <span className="text-sm text-muted-foreground">Subtotal</span>
          <span className="font-semibold">{formatCurrency(totalInvestment)}</span>
        </div>

        {/* Fees */}
        <div className="flex justify-between items-center">
          <span className="text-sm text-muted-foreground">Transaction Fees</span>
          <span className="font-semibold text-emerald-600">{formatCurrency(fees)}</span>
        </div>

        <Separator />

        {/* Total */}
        <div className="flex justify-between items-center">
          <span className="font-semibold">Total Investment</span>
          <span className="text-xl font-bold bg-gradient-to-r from-emerald-600 to-green-600 bg-clip-text text-transparent">
            {formatCurrency(totalInvestment)}
          </span>
        </div>

        <Separator className="my-4" />

        {/* Wallet Balance */}
        <div className="space-y-3">
          <div className="flex justify-between items-center">
            <span className="text-sm text-muted-foreground">Current Balance</span>
            <span className="font-semibold">{formatCurrency(walletBalance)}</span>
          </div>

          {/* Remaining Balance */}
          <div className="flex justify-between items-center">
            <span className="text-sm font-medium">Remaining Balance</span>
            <span
              className={cn(
                "font-bold text-lg",
                hasSufficientFunds
                  ? "text-emerald-600"
                  : "text-red-600 dark:text-red-500"
              )}
            >
              {formatCurrency(remainingBalance)}
            </span>
          </div>

          {/* Status Indicator */}
          {shares > 0 && (
            <div
              className={cn(
                "flex items-center gap-2 p-3 rounded-lg",
                hasSufficientFunds
                  ? "bg-emerald-50 dark:bg-emerald-950/20 text-emerald-700 dark:text-emerald-400"
                  : "bg-red-50 dark:bg-red-950/20 text-red-700 dark:text-red-400"
              )}
            >
              {hasSufficientFunds ? (
                <>
                  <CheckCircle className="h-5 w-5 flex-shrink-0" />
                  <span className="text-sm font-medium">Sufficient funds available</span>
                </>
              ) : (
                <>
                  <AlertCircle className="h-5 w-5 flex-shrink-0" />
                  <span className="text-sm font-medium">Insufficient funds in wallet</span>
                </>
              )}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )
}

export default InvestmentSummaryCard