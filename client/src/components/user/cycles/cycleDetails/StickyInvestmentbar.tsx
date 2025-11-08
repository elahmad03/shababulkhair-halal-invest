"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { formatCurrency } from "@/lib/utils"
import type { InvestmentCycle } from "@/db"
import { useRouter } from "next/navigation"
import { cn } from "@/lib/utils"

interface StickyInvestmentBarProps {
  cycle: InvestmentCycle
}

const StickyInvestmentBar = ({ cycle }: StickyInvestmentBarProps) => {
  const router = useRouter()
  const [isVisible, setIsVisible] = useState(false)
  const isOpenForInvestment = cycle.status === "open_for_investment"

  useEffect(() => {
    const toggleVisibility = () => {
      if (window.scrollY > 300) {
        setIsVisible(true)
      } else {
        setIsVisible(false)
      }
    }

    window.addEventListener("scroll", toggleVisibility)
    return () => window.removeEventListener("scroll", toggleVisibility)
  }, [])

  if (!isOpenForInvestment) return null

  return (
    <div
      className={cn(
        "fixed top-0 left-0 right-0 z-50 bg-white dark:bg-gray-900 border-b shadow-lg transition-transform duration-300",
        isVisible ? "translate-y-0" : "-translate-y-full"
      )}
    >
      <div className="container mx-auto px-4 py-3">
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-3 min-w-0">
            <Badge className="bg-emerald-500 text-white flex-shrink-0">
              Open
            </Badge>
            <div className="min-w-0">
              <h3 className="font-semibold text-sm sm:text-base truncate">
                {cycle.name}
              </h3>
              <p className="text-xs text-muted-foreground hidden sm:block">
                {formatCurrency(cycle.pricePerShare)} per share
              </p>
            </div>
          </div>
          <Button
            onClick={() => router.push(`/cycles/${cycle.id}/invest`)}
            className="bg-gradient-to-r from-emerald-500 to-green-600 hover:from-emerald-600 hover:to-green-700 flex-shrink-0"
            size="sm"
          >
            <span className="hidden sm:inline">Invest Now</span>
            <span className="sm:hidden">Invest</span>
          </Button>
        </div>
      </div>
    </div>
  )
}

export default StickyInvestmentBar