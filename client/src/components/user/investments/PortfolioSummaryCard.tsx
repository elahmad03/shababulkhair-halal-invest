import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { TrendingUp, Wallet } from "lucide-react"
import { formatCurrency } from "@/lib/utils"

interface PortfolioSummaryCardsProps {
  activeStaked: bigint
  lifetimeProfit: bigint
}

const PortfolioSummaryCards = ({ activeStaked, lifetimeProfit }: PortfolioSummaryCardsProps) => {
  return (
    <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 mb-6">
      <Card className="border-blue-100 bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-950 dark:to-indigo-950 hover:shadow-lg transition-shadow">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium text-blue-900 dark:text-blue-100">
            Active Investments
          </CardTitle>
          <div className="h-10 w-10 rounded-full bg-blue-100 dark:bg-blue-900 flex items-center justify-center">
            <Wallet className="h-5 w-5 text-blue-600 dark:text-blue-400" />
          </div>
        </CardHeader>
        <CardContent>
          <div className="text-2xl sm:text-3xl font-bold text-blue-700 dark:text-blue-400">
            {formatCurrency(activeStaked)}
          </div>
          <p className="text-xs text-muted-foreground mt-1">
            Currently staked in active cycles
          </p>
        </CardContent>
      </Card>

      <Card className="border-green-100 bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-950 dark:to-emerald-950 hover:shadow-lg transition-shadow">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium text-green-900 dark:text-green-100">
            Lifetime Profit
          </CardTitle>
          <div className="h-10 w-10 rounded-full bg-green-100 dark:bg-green-900 flex items-center justify-center">
            <TrendingUp className="h-5 w-5 text-green-600 dark:text-green-400" />
          </div>
        </CardHeader>
        <CardContent>
          <div className="text-2xl sm:text-3xl font-bold text-green-700 dark:text-green-400">
            {formatCurrency(lifetimeProfit)}
          </div>
          <p className="text-xs text-muted-foreground mt-1">
            Total earnings from completed cycles
          </p>
        </CardContent>
      </Card>
    </div>
  )
}

export default PortfolioSummaryCards