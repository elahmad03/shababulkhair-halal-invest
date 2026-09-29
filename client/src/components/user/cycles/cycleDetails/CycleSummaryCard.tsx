"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Calendar, TrendingUp, Clock, Target } from "lucide-react";
import { format } from "date-fns";
import { formatCurrency } from "@/lib/utils";
import type { Cycle } from "@/store/modules/cycle/cycle.types";
import { useRouter } from "next/navigation";

interface CycleSummaryCardProps {
  cycle: Cycle;
  className?: string;
}

const CycleSummaryCard = ({ cycle, className }: CycleSummaryCardProps) => {
  const router = useRouter();
  const isOpenForInvestment = cycle.status === "OPEN_FOR_INVESTMENT";

  const getStatusBadge = () => {
    switch (cycle.status) {
      case "OPEN_FOR_INVESTMENT":
        return <Badge className="bg-emerald-600 text-white">Open for Investment</Badge>;
      case "ACTIVE":
        return <Badge variant="secondary">Active</Badge>;
      case "CLOSING":
        return <Badge className="bg-amber-600 text-white">Closing</Badge>;
      case "COMPLETED":
        return <Badge variant="outline">Completed</Badge>;
      default:
        return <Badge variant="outline">Pending</Badge>;
    }
  };

  const formatDateSafe = (dateStr?: string | null, formatPattern = "PPP") => {
    if (!dateStr) return "-";
    try {
      const d = new Date(dateStr);
      return isNaN(d.getTime()) ? "-" : format(d, formatPattern);
    } catch {
      return "-";
    }
  };

  return (
    <Card className={className}>
      <CardHeader className="space-y-4">
        <div className="space-y-2">
          {getStatusBadge()}
          <CardTitle className="text-2xl sm:text-3xl font-bold">
            Investment Summary
          </CardTitle>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Price Per Share */}
        <div className="p-6 rounded-lg border bg-card text-card-foreground">
          <p className="text-sm text-muted-foreground mb-2">Price Per Share</p>
          <p className="text-4xl font-bold text-primary">
            {formatCurrency(Number(cycle.pricePerShareKobo))}
          </p>
        </div>

        <Separator />

        {/* Key Dates */}
        <div className="space-y-4">
          <div className="flex items-start gap-3">
            <Calendar className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
            <div className="flex-1">
              <p className="text-sm font-medium">Funding Window</p>
              <p className="text-sm text-muted-foreground">
                {formatDateSafe(cycle.fundingOpensAt, "MMM dd")} - {formatDateSafe(cycle.fundingClosesAt, "MMM dd, yyyy")}
              </p>
            </div>
          </div>

          <div className="flex items-start gap-3">
            <Clock className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
            <div className="flex-1">
              <p className="text-sm font-medium">Cycle Run Period</p>
              <p className="text-sm text-muted-foreground">
                {formatDateSafe(cycle.activeStartsAt, "MMM dd")} - {formatDateSafe(cycle.activeEndsAt, "MMM dd, yyyy")}
              </p>
            </div>
          </div>

          <div className="flex items-start gap-3">
            <Target className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
            <div className="flex-1">
              <p className="text-sm font-medium">Maturity Date</p>
              <p className="text-sm text-muted-foreground">
                {formatDateSafe(cycle.activeEndsAt, "MMMM dd, yyyy")}
              </p>
            </div>
          </div>

          <div className="flex items-start gap-3">
            <TrendingUp className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
            <div className="flex-1">
              <p className="text-sm font-medium">Profit Distribution</p>
              <p className="text-sm text-muted-foreground">Governed by Shariah Mudharabah model</p>
            </div>
          </div>
        </div>

        <Separator />

        {/* Investment Action */}
        {isOpenForInvestment ? (
          <div className="space-y-3">
            <Button
              onClick={() => router.push(`/user/invest/${cycle.id}`)}
              className="w-full h-12 text-base font-semibold shadow-lg hover:shadow-xl transition-all"
            >
              Invest Now
            </Button>
            <p className="text-xs text-center text-muted-foreground">
              Secure your shares before the funding window closes
            </p>
          </div>
        ) : (
          <div className="bg-muted/50 p-4 rounded-lg text-center">
            <p className="text-sm font-medium text-muted-foreground">
              {cycle.status === "COMPLETED" 
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