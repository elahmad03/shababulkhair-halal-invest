"use client"

import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { formatCurrency } from "@/lib/utils"
import { cn } from "@/lib/utils"
import { useRouter } from "next/navigation"
import { format } from "date-fns"


interface InvestmentCardProps {
  id: number
  cycleName: string
  cycleStatus: string
  shares: number
  amountInvested: bigint
  profitEarned: bigint
  investedAt: Date
}

const InvestmentCard = ({
  id,
  cycleName,
  cycleStatus,
  shares,
  amountInvested,
  profitEarned,
  investedAt,
}: InvestmentCardProps) => {
  const router = useRouter()
  const isCompleted = cycleStatus === "completed"
  const isActive = cycleStatus === "active"

  const getStatusConfig = (status: string) => {
    switch (status) {
      case "active":
        return { label: "Active", color: "bg-blue-500" }
      case "completed":
        return { label: "Completed", color: "bg-green-500" }
      default:
        return { label: "Pending", color: "bg-gray-400" }
    }
  }

  const statusConfig = getStatusConfig(cycleStatus)

  return (
    <Card
      onClick={() => router.push(`/user/investments/${id}`)}
      className="cursor-pointer hover:shadow-lg transition-all border-l-4 border-l-emerald-500"
    >
      <CardContent className="p-4 sm:p-6">
        {/* Header Row */}
        <div className="flex items-start justify-between mb-4">
          <div className="flex-1 min-w-0">
            <h3 className="font-bold text-lg truncate">{cycleName}</h3>
            <p className="text-xs text-muted-foreground">
              Invested {format(investedAt, "MMM dd, yyyy")}
            </p>
          </div>
          <Badge className={`${statusConfig.color} text-white ml-2 flex-shrink-0`}>
            {statusConfig.label}
          </Badge>
        </div>

        {/* Investment Details */}
        <div className="grid grid-cols-2 gap-4 mb-3">
          <div>
            <p className="text-xs text-muted-foreground mb-1">Invested</p>
            <p className="font-semibold text-emerald-700 dark:text-emerald-400">
              {formatCurrency(amountInvested)}
            </p>
          </div>
          <div>
            <p className="text-xs text-muted-foreground mb-1">Shares</p>
            <p className="font-semibold">{shares}</p>
          </div>
        </div>

        {/* Profit Row (Conditional) */}
        {isCompleted && profitEarned > 0n && (
          <div className="pt-3 border-t">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">Profit Earned</span>
              <span className="text-lg font-bold text-green-600 dark:text-green-400">
                +{formatCurrency(profitEarned)}
              </span>
            </div>
          </div>
        )}

        {isActive && (
          <div className="pt-3 border-t">
            <p className="text-xs text-blue-600 dark:text-blue-400 font-medium">
              🔄 Currently generating returns
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  )
}

export default InvestmentCard