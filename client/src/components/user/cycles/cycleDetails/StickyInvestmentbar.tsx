"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { formatCurrency } from "@/lib/utils"
import type { Cycle } from "@/store/modules/cycle/cycle.types"
import { useRouter } from "next/navigation"
import { cn } from "@/lib/utils"

interface StickyInvestmentBarProps {
  cycle: Cycle
}

const StickyInvestmentBar = ({ cycle }: StickyInvestmentBarProps) => {
  const router = useRouter()
  const [isVisible, setIsVisible] = useState(false)
  const isOpenForInvestment = cycle.status === "OPEN_FOR_INVESTMENT"

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
    <header
      className={cn(
        "fixed top-0 left-0 right-0 z-50 bg-background/95 backdrop-blur border-b border-border shadow-md transition-transform duration-300",
        isVisible ? "translate-y-0" : "-translate-y-full"
      )}
    >
      <div className="container mx-auto px-4 py-3">
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-3 min-w-0">
            <Badge className="bg-emerald-600 text-white flex-shrink-0">
              Open
            </Badge>
            <div className="min-w-0">
              <h3 className="font-semibold text-sm sm:text-base truncate">
                {cycle.cycleName}
              </h3>
              <p className="text-xs text-muted-foreground hidden sm:block">
                {formatCurrency(Number(cycle.pricePerShareKobo))} per share
              </p>
            </div>
          </div>
          <Button
            onClick={() => router.push(`/user/invest/${cycle.id}`)}
            size="sm"
            className="flex-shrink-0"
          >
            <span className="hidden sm:inline">Invest Now</span>
            <span className="sm:hidden">Invest</span>
          </Button>
        </div>
      </div>
    </header>
  )
}

export default StickyInvestmentBar