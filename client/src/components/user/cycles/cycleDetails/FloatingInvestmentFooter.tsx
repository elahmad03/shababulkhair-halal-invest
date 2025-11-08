"use client"

import { Button } from "@/components/ui/button"
import { formatCurrency } from "@/lib/utils"
import type { InvestmentCycle } from "@/db"
import { useRouter } from "next/navigation"
import { TrendingUp } from "lucide-react"

interface FloatingInvestmentFooterProps {
  cycle: InvestmentCycle
}

const FloatingInvestmentFooter = ({ cycle }: FloatingInvestmentFooterProps) => {
  const router = useRouter()
  const isOpenForInvestment = cycle.status === "open_for_investment"

  if (!isOpenForInvestment) return null

  return (
    <div className="lg:hidden fixed bottom-0 left-0 right-0 z-50 bg-white dark:bg-gray-900 border-t shadow-lg p-4">
      <div className="container mx-auto">
        <div className="flex items-center justify-between gap-4 mb-2">
          <div>
            <p className="text-xs text-muted-foreground">Price Per Share</p>
            <p className="text-lg font-bold bg-gradient-to-r from-emerald-600 to-green-600 bg-clip-text text-transparent">
              {formatCurrency(cycle.pricePerShare)}
            </p>
          </div>
          <Button
            onClick={() => router.push(`/cycles/${cycle.id}/invest`)}
            className="h-12 px-8 bg-gradient-to-r from-emerald-500 to-green-600 hover:from-emerald-600 hover:to-green-700 shadow-lg"
          >
            <TrendingUp className="mr-2 h-4 w-4" />
            Invest Now
          </Button>
        </div>
      </div>
    </div>
  )
}

export default FloatingInvestmentFooter