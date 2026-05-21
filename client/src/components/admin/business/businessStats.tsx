import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { TrendingUp, Wallet, Target, DollarSign } from "lucide-react"
import { formatCurrency } from "@/lib/utils"

interface BusinessStatsCardsProps {
  totalCapital: number
  totalProfit: number
  expectedProfit?: number
  ventureCount?: number
}

const BusinessStatsCards = ({
  totalCapital,
  totalProfit,
  expectedProfit = 0,
  ventureCount = 0,
}: BusinessStatsCardsProps) => {
  return (
    <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
      {/* Total Capital Card */}
      <Card className="hover:shadow-lg transition-shadow">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Total Allocated</CardTitle>
          <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
            <Wallet className="h-5 w-5 text-primary" />
          </div>
        </CardHeader>
        <CardContent>
          <div className="text-2xl sm:text-3xl font-bold text-primary">
            {formatCurrency(totalCapital)}
          </div>
          <p className="text-xs text-muted-foreground mt-1">
            Across all ventures
          </p>
        </CardContent>
      </Card>

      {/* Profit Realized Card */}
      <Card className="hover:shadow-lg transition-shadow">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Profit Realized</CardTitle>
          <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
            <TrendingUp className="h-5 w-5 text-primary" />
          </div>
        </CardHeader>
        <CardContent>
          <div className="text-2xl sm:text-3xl font-bold text-primary">
            {formatCurrency(totalProfit)}
          </div>
          <p className="text-xs text-muted-foreground mt-1">
            Confirmed returns
          </p>
        </CardContent>
      </Card>

      {/* Expected Profit Card */}
      <Card className="hover:shadow-lg transition-shadow">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Expected Profit</CardTitle>
          <div className="h-10 w-10 rounded-full bg-muted flex items-center justify-center">
            <Target className="h-5 w-5 text-muted-foreground" />
          </div>
        </CardHeader>
        <CardContent>
          <div className="text-2xl sm:text-3xl font-bold text-muted-foreground">
            {formatCurrency(expectedProfit)}
          </div>
          <p className="text-xs text-muted-foreground mt-1">
            Projected returns
          </p>
        </CardContent>
      </Card>

      {/* Venture Count Card */}
      <Card className="hover:shadow-lg transition-shadow">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Active Ventures</CardTitle>
          <div className="h-10 w-10 rounded-full bg-muted flex items-center justify-center">
            <DollarSign className="h-5 w-5 text-muted-foreground" />
          </div>
        </CardHeader>
        <CardContent>
          <div className="text-2xl sm:text-3xl font-bold text-muted-foreground">
            {ventureCount}
          </div>
          <p className="text-xs text-muted-foreground mt-1">
            Currently active
          </p>
        </CardContent>
      </Card>
    </div>
  )
}

export default BusinessStatsCards