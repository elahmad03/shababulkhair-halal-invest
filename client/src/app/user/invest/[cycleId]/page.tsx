"use client"

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

const InvestmentPage = async ({ params }: InvestmentPageProps) => {
  const { cycleId } = await params

  return (
    <div className="min-h-screen bg-background">
      <InvestmentCheckoutFormWrapper cycleId={cycleId} />
    </div>
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

  // Transform WalletSummary to Wallet format
  const wallet = {
    id: 0,
    userId: 0,
    balance: BigInt(walletData.data.balanceKobo),
    updatedAt: new Date().toISOString(),
  }

  return <InvestmentCheckoutForm cycle={cycleData.data} wallet={wallet} />
}

export default InvestmentPage