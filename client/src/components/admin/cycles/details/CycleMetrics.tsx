import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CycleDetails } from "@/lib/types/cycle";
import { formatCurrency } from "@/lib/utils";

interface CycleMetricsProps {
  cycleData: CycleDetails;
}

export function CycleMetrics({ cycleData }: CycleMetricsProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
      
      {/* Capital */}
      <Card>
        <CardHeader>
          <CardTitle className="text-sm text-muted-foreground">
            Total Capital Invested
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-2xl font-bold">
            {formatCurrency(cycleData.totalCapitalInvested)}
          </p>
        </CardContent>
      </Card>

      {/* Shares */}
      <Card>
        <CardHeader>
          <CardTitle className="text-sm text-muted-foreground">
            Total Shares Sold
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-2xl font-bold">
            {cycleData.totalSharesSold.toLocaleString()}
          </p>
        </CardContent>
      </Card>

      {/* Investors */}
      <Card>
        <CardHeader>
          <CardTitle className="text-sm text-muted-foreground">
            Number of Investors
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-2xl font-bold">
            {cycleData.numberOfInvestors}
          </p>
        </CardContent>
      </Card>

      {/* Profit */}
      <Card>
        <CardHeader>
          <CardTitle className="text-sm text-muted-foreground">
            Profit Realized
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-2xl font-bold">
            {formatCurrency(cycleData.profitRealized)}
          </p>
        </CardContent>
      </Card>

      {/* Investor Pool */}
      <Card>
        <CardHeader>
          <CardTitle className="text-sm text-muted-foreground">
            Investor Pool
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-2xl font-bold">
            {formatCurrency(cycleData.investorPool)}
          </p>
        </CardContent>
      </Card>

      {/* Org Share */}
      <Card>
        <CardHeader>
          <CardTitle className="text-sm text-muted-foreground">
            Organizational Share
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-2xl font-bold">
            {formatCurrency(cycleData.organizationalShare)}
          </p>
        </CardContent>
      </Card>

    </div>
  );
}