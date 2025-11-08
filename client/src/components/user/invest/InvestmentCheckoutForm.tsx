"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { Label } from "@/components/ui/label"
import { ArrowLeft, Wallet as WalletIcon, Loader2 } from "lucide-react"
import { formatCurrency } from "@/lib/utils"
import { toast } from "sonner"
import type { InvestmentCycle, Wallet } from "@/db/types"
import ShareCounter from "./ShareCounter"
import InvestmentSummaryCard from "./InvestmentSummaryCard"

interface InvestmentCheckoutFormProps {
  cycle: InvestmentCycle
  wallet: Wallet
}

const InvestmentCheckoutForm = ({ cycle, wallet }: InvestmentCheckoutFormProps) => {
  const router = useRouter()
  const [shares, setShares] = useState(0)
  const [termsAccepted, setTermsAccepted] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const totalInvestment = cycle.pricePerShare * BigInt(shares)
  const remainingBalance = wallet.balance - totalInvestment
  const hasSufficientFunds = remainingBalance >= 0n
  const canSubmit = shares > 0 && hasSufficientFunds && termsAccepted && !isSubmitting

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!canSubmit) return

    setIsSubmitting(true)

    try {
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 2000))

      // In real app, this would be an API call:
      // const response = await fetch('/api/investments', {
      //   method: 'POST',
      //   body: JSON.stringify({
      //     cycleId: cycle.id,
      //     shares,
      //     amount: totalInvestment.toString(),
      //   }),
      // })

      console.log("Investment payload:", {
        userId: wallet.userId,
        cycleId: cycle.id,
        shares,
        amountInvested: totalInvestment.toString(),
      })

      // Success!
      toast.success("🎉 Investment Successful!", {
        description: `You've invested ${formatCurrency(totalInvestment)} in ${cycle.name}`,
      })

      // Redirect to dashboard or investment details
      router.push("/user/dashboard")
    } catch (error) {
      toast.error("Investment Failed", {
        description: "Something went wrong. Please try again.",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
      {/* Back Button */}
      <Button
        variant="ghost"
        onClick={() => router.back()}
        className="mb-6 hover:bg-emerald-50 dark:hover:bg-emerald-950"
      >
        <ArrowLeft className="mr-2 h-4 w-4" />
        Back to Cycle Details
      </Button>

      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl sm:text-4xl font-bold mb-2">
          Invest in {cycle.name}
        </h1>
        <p className="text-muted-foreground">
          Secure your shares at {formatCurrency(cycle.pricePerShare)} per share
        </p>
      </div>

      <form onSubmit={handleSubmit}>
        {/* Two Column Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8">
          {/* Left Column - Input Section */}
          <div className="lg:col-span-7 space-y-6">
            {/* Wallet Context Card */}
            <Card className="border-emerald-200 bg-gradient-to-br from-emerald-50 to-green-50 dark:from-emerald-950 dark:to-green-950">
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="h-12 w-12 rounded-full bg-emerald-500 flex items-center justify-center">
                      <WalletIcon className="h-6 w-6 text-white" />
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">
                        Available to Invest
                      </p>
                      <p className="text-2xl font-bold text-emerald-700 dark:text-emerald-400">
                        {formatCurrency(wallet.balance)}
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
                  {formatCurrency(cycle.pricePerShare)} per share
                </p>
              </CardHeader>
              <CardContent className="pt-8 pb-10">
                <ShareCounter shares={shares} onSharesChange={setShares} />
              </CardContent>
            </Card>

            {/* Mobile Summary (shown only on mobile) */}
            <div className="lg:hidden">
              <InvestmentSummaryCard
                pricePerShare={cycle.pricePerShare}
                shares={shares}
                walletBalance={wallet.balance}
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
                      {cycle.endDate && new Date(cycle.endDate).toLocaleDateString("en-US", {
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
            <div className="lg:hidden sticky bottom-0 bg-white dark:bg-gray-900 pt-4 pb-6 -mx-4 px-4 border-t">
              <Button
                type="submit"
                disabled={!canSubmit}
                className="w-full h-14 text-lg font-semibold bg-gradient-to-r from-emerald-500 to-green-600 hover:from-emerald-600 hover:to-green-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                    Processing...
                  </>
                ) : (
                  <>
                    CONFIRM INVESTMENT
                    {shares > 0 && ` (${formatCurrency(totalInvestment)})`}
                  </>
                )}
              </Button>
              {!canSubmit && shares > 0 && (
                <p className="text-xs text-center text-red-600 dark:text-red-400 mt-2">
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
                pricePerShare={cycle.pricePerShare}
                shares={shares}
                walletBalance={wallet.balance}
              />

              <Button
                type="submit"
                disabled={!canSubmit}
                className="w-full h-14 text-lg font-semibold bg-gradient-to-r from-emerald-500 to-green-600 hover:from-emerald-600 hover:to-green-700 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                    Processing...
                  </>
                ) : (
                  <>
                    CONFIRM INVESTMENT
                    {shares > 0 && ` (${formatCurrency(totalInvestment)})`}
                  </>
                )}
              </Button>

              {!canSubmit && shares > 0 && (
                <p className="text-xs text-center text-red-600 dark:text-red-400">
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
  )
}

export default InvestmentCheckoutForm