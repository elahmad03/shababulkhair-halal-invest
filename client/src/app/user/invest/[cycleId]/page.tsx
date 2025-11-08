import { notFound } from "next/navigation"
import InvestmentCheckoutForm from "@/components/user/invest/InvestmentCheckoutForm"
import { mockInvestmentCycles, mockWallets } from "@/db"

interface InvestmentPageProps {
  params: Promise<{
    cycleId: string
  }>
}

const InvestmentPage = async ({ params }: InvestmentPageProps) => {
  const { cycleId } = await params
  const cycleIdNum = parseInt(cycleId)
  
  const cycle = mockInvestmentCycles.find((c) => c.id === cycleIdNum)

  if (!cycle) {
    notFound()
  }

  // In real app, get current user's wallet from auth
  const currentUserId = 1
  const userWallet = mockWallets.find((w) => w.userId === currentUserId)

  if (!userWallet) {
    notFound()
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50/30 to-green-50/30 dark:from-gray-950 dark:to-gray-900">
      <InvestmentCheckoutForm cycle={cycle} wallet={userWallet} />
    </div>
  )
}

export default InvestmentPage