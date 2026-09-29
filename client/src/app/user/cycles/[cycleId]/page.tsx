"use client";

import { use } from "react";
import { notFound } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import CycleSummaryCard from "@/components/user/cycles/cycleDetails/CycleSummaryCard";
import StickyInvestmentBar from "@/components/user/cycles/cycleDetails/StickyInvestmentbar";
import FloatingInvestmentFooter from "@/components/user/cycles/cycleDetails/FloatingInvestmentFooter";
import { useGetCycleByIdQuery } from "@/store/hooks";
import { formatCurrency } from "@/lib/utils";
import { format } from "date-fns";
import {
  Calendar,
  Clock,
  Target,
  TrendingUp,
  Briefcase,
  Shield,
  AlertCircle,
  Loader2,
} from "lucide-react";
import type { Cycle } from "@/store/modules/cycle/cycle.types";

interface CycleDetailsPageProps {
  params: Promise<{
    cycleId: string;
  }>;
}

const CycleDetailsPageContent = ({
  cycle,
  isLoading,
  isError,
  error,
}: {
  cycleId: string;
  cycle: Cycle | null;
  isLoading: boolean;
  isError: boolean;
  error: unknown;
}) => {
  // Loading state
  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center space-y-4">
          <Loader2 className="h-12 w-12 animate-spin mx-auto text-primary" />
          <p className="text-lg text-muted-foreground">Loading cycle details...</p>
        </div>
      </div>
    );
  }

  // Error state
  if (isError || !cycle) {
    const errorMessage =
      error &&
      typeof error === "object" &&
      "data" in error &&
      typeof error.data === "object" &&
      error.data !== null &&
      "message" in error.data
        ? (error.data as { message: string }).message
        : "Failed to load cycle details. Please try again.";

    return (
      <div className="container mx-auto px-4 py-8">
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{errorMessage}</AlertDescription>
        </Alert>
      </div>
    );
  }

  const getStatusConfig = (status: string) => {
    switch (status) {
      case "OPEN_FOR_INVESTMENT":
        return { label: "Open for Investment", color: "bg-emerald-600 text-white" };
      case "ACTIVE":
        return { label: "Active", color: "bg-primary text-primary-foreground" };
      case "CLOSING":
        return { label: "Closing", color: "bg-amber-600 text-white" };
      case "COMPLETED":
        return { label: "Completed", color: "bg-muted text-muted-foreground" };
      default:
        return { label: "Pending", color: "bg-muted text-muted-foreground" };
    }
  };

  const statusConfig = getStatusConfig(cycle.status ?? "PENDING");
  const pricePerShare = Number(cycle.pricePerShareKobo);

  const formatDateSafe = (dateStr?: string | null, formatPattern = "PPP") => {
    if (!dateStr) return "N/A";
    try {
      const d = new Date(dateStr);
      return isNaN(d.getTime()) ? "N/A" : format(d, formatPattern);
    } catch {
      return "N/A";
    }
  };

  const calculateDuration = (startStr?: string | null, endStr?: string | null) => {
    if (!startStr || !endStr) return "N/A";
    try {
      const start = new Date(startStr);
      const end = new Date(endStr);
      if (isNaN(start.getTime()) || isNaN(end.getTime())) return "N/A";
      const diffTime = Math.abs(end.getTime() - start.getTime());
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      const months = Math.floor(diffDays / 30);
      if (months > 0) return `${months} Month${months > 1 ? "s" : ""}`;
      return `${diffDays} Day${diffDays > 1 ? "s" : ""}`;
    } catch {
      return "N/A";
    }
  };

  return (
    <>
      <StickyInvestmentBar cycle={cycle} />

      <main className="min-h-screen pb-24 lg:pb-8">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8">
            {/* Left Column - Main Content */}
            <div className="lg:col-span-7 space-y-6">
              {/* Hero Section */}
              <Card className="border">
                <CardHeader className="space-y-4">
                  <Badge className={`${statusConfig.color} w-fit`}>
                    {statusConfig.label}
                  </Badge>
                  <div>
                    <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold mb-2">
                      {cycle.cycleName}
                    </h1>
                    <p className="text-xl sm:text-2xl font-semibold text-primary">
                      {formatCurrency(pricePerShare)} per share
                    </p>
                  </div>
                </CardHeader>
              </Card>

              {/* The Offer - Key Terms */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-2xl">The Offer</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                    {/* Funding Window */}
                    <div className="flex items-start gap-4">
                      <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                        <Calendar className="h-6 w-6 text-primary" />
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">Funding Window</p>
                        <p className="font-semibold">
                          {formatDateSafe(cycle.fundingOpensAt, "MMM dd")} - {formatDateSafe(cycle.fundingClosesAt, "MMM dd, yyyy")}
                        </p>
                      </div>
                    </div>

                    {/* Duration */}
                    <div className="flex items-start gap-4">
                      <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                        <Clock className="h-6 w-6 text-primary" />
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">Cycle Duration</p>
                        <p className="font-semibold">
                          {calculateDuration(cycle.activeStartsAt, cycle.activeEndsAt)}
                        </p>
                      </div>
                    </div>

                    {/* Maturity Date */}
                    <div className="flex items-start gap-4">
                      <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                        <Target className="h-6 w-6 text-primary" />
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">Maturity Date</p>
                        <p className="font-semibold">
                          {formatDateSafe(cycle.activeEndsAt, "MMMM dd, yyyy")}
                        </p>
                      </div>
                    </div>

                    {/* Allocation */}
                    <div className="flex items-start gap-4">
                      <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                        <Briefcase className="h-6 w-6 text-primary" />
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">Projected Allocation</p>
                        <p className="font-semibold">Halal Enterprise & Trading</p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Investment Overview */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-2xl">Investment Overview</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <p className="text-base leading-relaxed text-foreground">
                    {cycle.description ||
                      "Capital pooled during the funding window is deployed directly to vetted community ventures operating under Shariah principles."}
                  </p>
                  <p className="text-base leading-relaxed text-muted-foreground">
                    Profits realized at cycle completion are distributed to shareholders proportionally according to the agreed Mudharabah profit-sharing ratio.
                  </p>
                </CardContent>
              </Card>

              {/* Risk Disclosure */}
              <Card className="border-amber-200 bg-amber-50/50 dark:bg-amber-950/20">
                <CardHeader>
                  <div className="flex items-center gap-2">
                    <Shield className="h-5 w-5 text-amber-600" />
                    <CardTitle className="text-xl">Important Information</CardTitle>
                  </div>
                </CardHeader>
                <CardContent className="space-y-2 text-sm text-muted-foreground">
                  <p>• All business ventures carry economic risks. Past performance does not guarantee future results.</p>
                  <p>• Capital is actively deployed in real commercial operations for the duration of the active cycle.</p>
                  <p>• Returns depend on realized business performance.</p>
                </CardContent>
              </Card>
            </div>

            {/* Right Column - Desktop Summary */}
            <div className="hidden lg:block lg:col-span-5">
              <div className="sticky top-6">
                <CycleSummaryCard cycle={cycle} />
              </div>
            </div>
          </div>
        </div>

        {/* Mobile Summary */}
        <div className="lg:hidden container mx-auto px-4 pb-6">
          <CycleSummaryCard cycle={cycle} />
        </div>

        <FloatingInvestmentFooter cycle={cycle} />
      </main>
    </>
  );
};

export default function CycleDetailsPage({ params }: CycleDetailsPageProps) {
  const { cycleId } = use(params);

  if (!cycleId) notFound();

  const { data: response, isLoading, isError, error } = useGetCycleByIdQuery(cycleId);
  const cycle = response?.data ?? null;

  return (
    <CycleDetailsPageContent
      cycleId={cycleId}
      cycle={cycle}
      isLoading={isLoading}
      isError={isError}
      error={error}
    />
  );
}