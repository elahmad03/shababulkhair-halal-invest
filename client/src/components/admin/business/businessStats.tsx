import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { TrendingUp, Wallet } from "lucide-react"
import { formatCurrency } from "@/lib/utils"

interface BusinessStatsCardsProps {
  totalCapital: bigint
  totalProfit: bigint
}

const BusinessStatsCards = ({ totalCapital, totalProfit }: BusinessStatsCardsProps) => {
  return (
    <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 mb-6">
      <Card className="border-emerald-100 bg-gradient-to-br from-emerald-50 to-white hover:shadow-lg transition-shadow">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium text-emerald-900">
            Total Capital Allocated
          </CardTitle>
          <div className="h-10 w-10 rounded-full bg-emerald-100 flex items-center justify-center">
            <Wallet className="h-5 w-5 text-emerald-600" />
          </div>
        </CardHeader>
        <CardContent>
          <div className="text-2xl sm:text-3xl font-bold bg-gradient-to-r from-emerald-600 to-green-600 bg-clip-text text-transparent">
            {formatCurrency(totalCapital)}
          </div>
          <p className="text-xs text-muted-foreground mt-1">
            Across all active ventures
          </p>
        </CardContent>
      </Card>

      <Card className="border-green-100 bg-gradient-to-br from-green-50 to-white hover:shadow-lg transition-shadow">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium text-green-900">
            Total Profit Realized
          </CardTitle>
          <div className="h-10 w-10 rounded-full bg-green-100 flex items-center justify-center">
            <TrendingUp className="h-5 w-5 text-green-600" />
          </div>
        </CardHeader>
        <CardContent>
          <div className="text-2xl sm:text-3xl font-bold bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent">
            {formatCurrency(totalProfit)}
          </div>
          <p className="text-xs text-muted-foreground mt-1">
            From all completed ventures
          </p>
        </CardContent>
      </Card>
    </div>
  )
}

export default BusinessStatsCards