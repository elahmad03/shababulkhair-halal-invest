

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { CycleDetails } from "@/lib/types/cycle"
import { formatCurrency } from "@/lib/utils"

interface CycleMetricsProps {
  cycleData: CycleDetails
}

export function CycleMetrics({ cycleData }: CycleMetricsProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
      <Card>
        <CardHeader>
          <CardTitle className="text-sm font-medium text-muted-foreground">
            Total Capital Invested
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-2xl font-bold">
            {formatCurrency(cycleData.totalCapitalInvested)}
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-sm font-medium text-muted-foreground">
            Total Shares Sold
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-2xl font-bold">
            {cycleData.totalSharesSold.toLocaleString()}
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-sm font-medium text-muted-foreground">
            Number of Investors
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-2xl font-bold">{cycleData.numberOfInvestors}</p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-sm font-medium text-muted-foreground">
            Profit Realized
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-2xl font-bold">
            {cycleData.profitRealized
              ? `${formatCurrency(cycleData.profitRealized)}`
              : "N/A"}
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-sm font-medium text-muted-foreground">
            Investor Pool 
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-2xl font-bold">
            {cycleData.investorPool
              ? `${formatCurrency(cycleData.investorPool)}`
              : "N/A"}
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-sm font-medium text-muted-foreground">
            Organizational Share 
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-2xl font-bold">
            {cycleData.organizationalShare
              ? `${formatCurrency(cycleData.organizationalShare)}`
              : "N/A"}
          </p>
        </CardContent>
      </Card>
    </div>
  )
}