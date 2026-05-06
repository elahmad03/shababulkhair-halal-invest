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
import type { Cycle } from "@/store/modules/cycle/cycle.types"
import type { Wallet } from "@/store/modules/wallet/wallet.types"
import ShareCounter from "./ShareCounter"
import InvestmentSummaryCard from "./InvestmentSummaryCard"

interface InvestmentCheckoutFormProps {
  cycle: Cycle
  wallet: Wallet
}

const InvestmentCheckoutForm = ({ cycle, wallet }: InvestmentCheckoutFormProps) => {
  const router = useRouter()
  const [shares, setShares] = useState(0)
  const [termsAccepted, setTermsAccepted] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const pricePerShareNaira = Number(cycle.pricePerShareKobo) / 100
  const totalInvestment = pricePerShareNaira * shares
  const walletBalanceNaira = Number(wallet.balance) / 100
  const remainingBalance = walletBalanceNaira - totalInvestment
  const hasSufficientFunds = remainingBalance >= 0
  const canSubmit = shares > 0 && hasSufficientFunds && termsAccepted && !isSubmitting

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!canSubmit) return

    setIsSubmitting(true)

    try {
      // TODO: Replace with real API call to create investment
      // const response = await createInvestmentMutation({
      //   cycleId: cycle.id,
      //   shares,
      //   amount: Math.round(totalInvestment * 100), // Convert back to Kobo
      // }).unwrap()

      await new Promise((resolve) => setTimeout(resolve, 2000))

      console.log("Investment payload:", {
        cycleId: cycle.id,
        shares,
        amountInvestedNaira: totalInvestment,
        amountInvestedKobo: Math.round(totalInvestment * 100),
      })

      toast.success("🎉 Investment Successful!", {
        description: `You've invested ₦${totalInvestment.toLocaleString()} in ${cycle.cycleName}`,
      })

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
        className="mb-6 hover:bg-muted"
      >
        <ArrowLeft className="mr-2 h-4 w-4" />
        Back to Cycle Details
      </Button>

      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl sm:text-4xl font-bold mb-2">
          Invest in {cycle.cycleName}
        </h1>
        <p className="text-muted-foreground">
          Secure your shares at ₦{pricePerShareNaira.toLocaleString()} per share
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
                        ₦{walletBalanceNaira.toLocaleString()}
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
                  ₦{pricePerShareNaira.toLocaleString()} per share
                </p>
              </CardHeader>
              <CardContent className="pt-8 pb-10">
                <ShareCounter shares={shares} onSharesChange={setShares} />
              </CardContent>
            </Card>

            {/* Mobile Summary (shown only on mobile) */}
            <div className="lg:hidden">
              <InvestmentSummaryCard
                pricePerShareNaira={pricePerShareNaira}
                shares={shares}
                walletBalanceNaira={walletBalanceNaira}
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
            <div className="lg:hidden sticky bottom-0 bg-background dark:bg-background pt-4 pb-6 -mx-4 px-4 border-t border-border">
              <Button
                type="submit"
                disabled={!canSubmit}
                className="w-full h-14 text-lg font-semibold bg-primary hover:bg-primary/90 text-primary-foreground disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                    Processing...
                  </>
                ) : (
                  <>
                    CONFIRM INVESTMENT
                    {shares > 0 && ` (₦${totalInvestment.toLocaleString()})`}
                  </>
                )}
              </Button>
              {!canSubmit && shares > 0 && (
                <p className="text-xs text-center text-destructive dark:text-destructive mt-2">
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
                pricePerShareNaira={pricePerShareNaira}
                shares={shares}
                walletBalanceNaira={walletBalanceNaira}
              />

              <Button
                type="submit"
                disabled={!canSubmit}
                className="w-full h-14 text-lg font-semibold bg-primary hover:bg-primary/90 text-primary-foreground disabled:opacity-50 disabled:cursor-not-allowed shadow-lg"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                    Processing...
                  </>
                ) : (
                  <>
                    CONFIRM INVESTMENT
                    {shares > 0 && ` (₦${totalInvestment.toLocaleString()})`}
                  </>
                )}
              </Button>

              {!canSubmit && shares > 0 && (
                <p className="text-xs text-center text-destructive dark:text-destructive">
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