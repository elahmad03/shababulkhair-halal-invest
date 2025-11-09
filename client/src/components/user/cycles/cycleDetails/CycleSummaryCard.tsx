"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Calendar, TrendingUp, Clock, Target } from "lucide-react";
import { format } from "date-fns";
import { formatCurrency } from "@/lib/utils";
import type { InvestmentCycle } from "@/db";
import { useRouter } from "next/navigation";

interface CycleSummaryCardProps {
  cycle: InvestmentCycle;
  className?: string;
}

const CycleSummaryCard = ({ cycle, className }: CycleSummaryCardProps) => {
  const router = useRouter();
  const isOpenForInvestment = cycle.status === "open_for_investment";

  const getStatusConfig = (status: string) => {
    switch (status) {
      case "open_for_investment":
        return { label: "Open for Investment", variant: "default" as const, color: "bg-emerald-500" };
      case "active":
        return { label: "Active", variant: "secondary" as const, color: "bg-blue-500" };
      case "completed":
        return { label: "Completed", variant: "outline" as const, color: "bg-gray-500" };
      default:
        return { label: "Pending", variant: "outline" as const, color: "bg-gray-400" };
    }
  };

  // FIX: Use nullish coalescing (??) to provide a default "pending" value
  // if cycle.status is null, satisfying the `getStatusConfig(status: string)` signature.
  const statusConfig = getStatusConfig(cycle.status ?? "pending");

  return (
    <Card className={className}>
      <CardHeader className="space-y-4">
        <div className="space-y-2">
          <Badge 
            variant={statusConfig.variant}
            className={`${statusConfig.color} text-white`}
          >
            {statusConfig.label}
          </Badge>
          <CardTitle className="text-2xl sm:text-3xl font-bold">
            Investment Summary
          </CardTitle>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Price Per Share */}
        <div className="bg-gradient-to-br from-emerald-50 to-green-50 dark:from-emerald-950 dark:to-green-950 p-6 rounded-lg border border-emerald-200 dark:border-emerald-800">
          <p className="text-sm text-muted-foreground mb-2">Price Per Share</p>
          <p className="text-4xl font-bold bg-gradient-to-r from-emerald-600 to-green-600 bg-clip-text text-transparent">
            {formatCurrency(Number(cycle.pricePerShare))}
          </p>
        </div>

        <Separator />

        {/* Key Dates */}
        <div className="space-y-4">
          <div className="flex items-start gap-3">
            <Calendar className="h-5 w-5 text-emerald-600 mt-0.5 flex-shrink-0" />
            <div className="flex-1">
              <p className="text-sm font-medium">Investment Window</p>
              <p className="text-sm text-muted-foreground">
                {cycle.startDate && format(new Date(cycle.startDate), "MMM dd")} - {cycle.endDate && format(new Date(cycle.endDate), "MMM dd, yyyy")}
              </p>
            </div>
          </div>

          <div className="flex items-start gap-3">
            <Clock className="h-5 w-5 text-emerald-600 mt-0.5 flex-shrink-0" />
            <div className="flex-1">
              <p className="text-sm font-medium">Duration</p>
              <p className="text-sm text-muted-foreground">30 Days</p>
            </div>
          </div>

          <div className="flex items-start gap-3">
            <Target className="h-5 w-5 text-emerald-600 mt-0.5 flex-shrink-0" />
            <div className="flex-1">
              <p className="text-sm font-medium">Maturity Date</p>
              <p className="text-sm text-muted-foreground">
                {cycle.endDate && format(new Date(cycle.endDate), "MMMM dd, yyyy")}
              </p>
            </div>
          </div>

          <div className="flex items-start gap-3">
            <TrendingUp className="h-5 w-5 text-emerald-600 mt-0.5 flex-shrink-0" />
            <div className="flex-1">
              <p className="text-sm font-medium">Profit Distribution</p>
              <p className="text-sm text-muted-foreground">80% to Investors, 20% to Organization</p>
            </div>
          </div>
        </div>

        <Separator />

        {/* Investment Action */}
        {isOpenForInvestment ? (
          <div className="space-y-3">
            <Button
              onClick={() => router.push(`/cycles/${cycle.id}/invest`)}
              className="w-full h-12 text-base font-semibold bg-gradient-to-r from-emerald-500 to-green-600 hover:from-emerald-600 hover:to-green-700 shadow-lg hover:shadow-xl transition-all"
            >
              Invest Now
            </Button>
            <p className="text-xs text-center text-muted-foreground">
              Secure your shares before the window closes
            </p>
          </div>
        ) : (
          <div className="bg-muted/50 p-4 rounded-lg text-center">
            <p className="text-sm font-medium text-muted-foreground">
              {cycle.status === "completed" 
                ? "This cycle has been completed" 
                : "This cycle is not currently open for investment"}
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default CycleSummaryCard;