"use client"

import { use } from "react"
import { notFound } from "next/navigation"
import InvestmentCheckoutForm from "@/components/user/invest/InvestmentCheckoutForm"
import { useGetCycleByIdQuery } from "@/store/modules/cycle/cycleApi"
import { useGetWalletSummaryQuery } from "@/store/modules/wallet/walletApi"
import { Loader2 } from "lucide-react"

interface InvestmentPageProps {
  params: Promise<{
    cycleId: string
  }>
}

export default function InvestmentPage({ params }: InvestmentPageProps) {
  const { cycleId } = use(params)

  return (
    <main className="min-h-screen bg-background">
      <InvestmentCheckoutFormWrapper cycleId={cycleId} />
    </main>
  )
}

function InvestmentCheckoutFormWrapper({ cycleId }: { cycleId: string }) {
  const { data: cycleData, isLoading: cycleLoading, error: cycleError } = useGetCycleByIdQuery(cycleId)
  const { data: walletData, isLoading: walletLoading, error: walletError } = useGetWalletSummaryQuery()

  if (cycleLoading || walletLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }

  if (cycleError || walletError || !cycleData?.data || !walletData?.data) {
    notFound()
  }

  const wallet = {
    balanceKobo: walletData.data.balanceKobo,
    lockedBalanceKobo: walletData.data.lockedBalanceKobo,
    totalKobo: (
      BigInt(walletData.data.balanceKobo || "0") + BigInt(walletData.data.lockedBalanceKobo || "0")
    ).toString(),
  }

  return <InvestmentCheckoutForm cycle={cycleData.data} wallet={wallet} />
}