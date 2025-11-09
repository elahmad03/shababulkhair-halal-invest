

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { CycleDetails } from "@/lib/types/cycle"

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
            ₦{cycleData.totalCapitalInvested.toLocaleString()}
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
              ? `₦${cycleData.profitRealized.toLocaleString()}`
              : "N/A"}
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-sm font-medium text-muted-foreground">
            Investor Pool (80%)
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-2xl font-bold">
            {cycleData.investorPool
              ? `₦${cycleData.investorPool.toLocaleString()}`
              : "N/A"}
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-sm font-medium text-muted-foreground">
            Organizational Share (20%)
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-2xl font-bold">
            {cycleData.organizationalShare
              ? `₦${cycleData.organizationalShare.toLocaleString()}`
              : "N/A"}
          </p>
        </CardContent>
      </Card>
    </div>
  )
}