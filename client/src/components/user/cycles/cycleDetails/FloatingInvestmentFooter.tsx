"use client"

import { Button } from "@/components/ui/button"
import { formatCurrency } from "@/lib/utils"
import type { Cycle } from "@/store/modules/cycle/cycle.types"
import { useRouter } from "next/navigation"
import { TrendingUp } from "lucide-react"

interface FloatingInvestmentFooterProps {
  cycle: Cycle
}

const FloatingInvestmentFooter = ({ cycle }: FloatingInvestmentFooterProps) => {
  const router = useRouter()
  const isOpenForInvestment = cycle.status === "OPEN_FOR_INVESTMENT"

  if (!isOpenForInvestment) return null

  return (
    <footer className="lg:hidden fixed bottom-0 left-0 right-0 z-50 bg-background border-t border-border shadow-lg p-4">
      <div className="container mx-auto">
        <div className="flex items-center justify-between gap-4">
          <div>
            <p className="text-xs text-muted-foreground">Price Per Share</p>
            <p className="text-lg font-bold text-primary">
              {formatCurrency(Number(cycle.pricePerShareKobo))}
            </p>
          </div>
          <Button
            onClick={() => router.push(`/user/invest/${cycle.id}`)}
            className="h-11 px-6 shadow-md"
          >
            <TrendingUp className="mr-2 h-4 w-4" />
            Invest Now
          </Button>
        </div>
      </div>
    </footer>
  )
}

export default FloatingInvestmentFooter