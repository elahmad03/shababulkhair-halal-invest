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
      bgColor: "bg-blue-50",
      iconColor: "text-blue-600",
      borderColor: "border-blue-100",
      description: `${cycleData.totalSharesSold} shares sold`,
    },
    {
      title: "Number of Investors",
      value: cycleData.numberOfInvestors.toLocaleString(),
      icon: Users,
      bgColor: "bg-emerald-50",
      iconColor: "text-emerald-600",
      borderColor: "border-emerald-100",
      description: `Investor participation`,
    },
    {
      title: "Business Ventures",
      value: cycleData.ventureCount.toLocaleString(),
      icon: Briefcase,
      bgColor: "bg-amber-50",
      iconColor: "text-amber-600",
      borderColor: "border-amber-100",
      description: `Active ventures`,
    },
    {
      title: "Profit Realized",
      value: formatCurrency(cycleData.profitRealized),
      icon: Zap,
      bgColor: "bg-green-50",
      iconColor: "text-green-600",
      borderColor: "border-green-100",
      description: `Total profit generated`,
    },
    {
      title: "Investor Pool (80%)",
      value: formatCurrency(cycleData.investorPool),
      icon: PieChart,
      bgColor: "bg-indigo-50",
      iconColor: "text-indigo-600",
      borderColor: "border-indigo-100",
      description: `Distributed to investors`,
    },
    {
      title: "Organizational Share (20%)",
      value: formatCurrency(cycleData.organizationalShare),
      icon: Target,
      bgColor: "bg-orange-50",
      iconColor: "text-orange-600",
      borderColor: "border-orange-100",
      description: `Organizational allocation`,
    },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
      {metrics.map((metric, index) => {
        const Icon = metric.icon;
        return (
          <Card
            key={index}
            className={`border ${metric.borderColor} ${metric.bgColor} hover:shadow-lg transition-shadow`}
          >
            <CardHeader className="pb-3">
              <div className="flex items-start justify-between">
                <div>
                  <CardTitle className="text-sm font-medium text-slate-700">
                    {metric.title}
                  </CardTitle>
                  <p className="text-xs text-slate-500 mt-1">
                    {metric.description}
                  </p>
                </div>
                <Icon className={`h-5 w-5 ${metric.iconColor}`} />
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold text-slate-900">
                {metric.value}
              </p>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}