import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CycleDetails } from "@/lib/types/cycle";
import { formatCurrency } from "@/lib/utils";
import { TrendingUp, Users, Zap, PieChart, Target, Briefcase } from "lucide-react";

interface CycleMetricsProps {
  cycleData: CycleDetails;
}

export function CycleMetrics({ cycleData }: CycleMetricsProps) {
  const metrics = [
    {
      title: "Total Capital Invested",
      value: formatCurrency(cycleData.totalCapitalInvested),
      icon: TrendingUp,
      description: `${cycleData.totalSharesSold} shares sold`,
    },
    {
      title: "Number of Investors",
      value: cycleData.numberOfInvestors.toLocaleString(),
      icon: Users,
      description: "Investor participation",
    },
    {
      title: "Business Ventures",
      value: cycleData.ventureCount.toLocaleString(),
      icon: Briefcase,
      description: "Allocated ventures",
    },
    {
      title: "Profit Realized",
      value: formatCurrency(cycleData.profitRealized),
      icon: Zap,
      description: "Total profit generated",
    },
    {
      title: "Investor Profit Pool",
      value: formatCurrency(cycleData.investorPool),
      icon: PieChart,
      description: "Allocated to investors",
    },
    {
      title: "Organizational Share",
      value: formatCurrency(cycleData.organizationalShare),
      icon: Target,
      description: "Organizational allocation",
    },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
      {metrics.map((metric, index) => {
        const Icon = metric.icon;
        return (
          <Card
            key={index}
            className="border bg-card text-card-foreground hover:shadow-md transition-shadow"
          >
            <CardHeader className="pb-3">
              <div className="flex items-start justify-between">
                <div>
                  <CardTitle className="text-sm font-medium text-muted-foreground">
                    {metric.title}
                  </CardTitle>
                  <p className="text-xs text-muted-foreground mt-1">
                    {metric.description}
                  </p>
                </div>
                <div className="h-9 w-9 rounded-lg bg-primary/10 flex items-center justify-center">
                  <Icon className="h-5 w-5 text-primary" />
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold text-foreground">
                {metric.value}
              </p>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}
