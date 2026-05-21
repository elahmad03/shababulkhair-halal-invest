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

// Adapter to convert API Cycle to InvestmentCycle-like format
const adaptCycleForComponents = (cycle: Cycle): any => {
  return {
    id: Number(cycle.id),
    name: cycle.cycleName,
    status: cycle.status,
    pricePerShare: Number(cycle.pricePerShareKobo) / 100,
    startDate: cycle.startDate ? new Date(cycle.startDate) : null,
    endDate: cycle.endDate ? new Date(cycle.endDate) : null,
    description: cycle.description || "",
    PricePerShareKobo: cycle.pricePerShareKobo,
  };
};

const CycleDetailsPageContent = ({ cycleId, cycle, isLoading, isError, error }: { 
  cycleId: string;
  cycle: Cycle | null;
  isLoading: boolean;
  isError: boolean;
  error: any;
}) => {
  // Loading state
  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center space-y-4">
          <Loader2 className="h-12 w-12 animate-spin mx-auto text-emerald-600" />
          <p className="text-lg text-muted-foreground">Loading cycle details...</p>
        </div>
      </div>
    );
  }

  // Error state
  if (isError || !cycle) {
    const errorMessage = 
      error && 'data' in error && typeof error.data === 'object' && error.data !== null && 'message' in error.data
        ? (error.data as { message: string }).message
        : "Failed to load cycle details. Please try again.";
    
    return (
      <div className="min-h-screen flex items-center justify-center px-4">
        <Alert variant="destructive" className="max-w-md border-red-200 bg-red-50">
          <AlertCircle className="h-4 w-4 text-red-600" />
          <AlertDescription className="text-red-800">
            {errorMessage}
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  // Adapt the cycle for components that expect the old format
  const adaptedCycle = adaptCycleForComponents(cycle);

  // Helper to map status to UI
  const getStatusConfig = (status: string) => {
    switch (status) {
      case "OPEN_FOR_INVESTMENT":
        return { label: "Open for Investment", color: "bg-emerald-500" };
      case "ACTIVE":
        return { label: "Active", color: "bg-blue-500" };
      case "COMPLETED":
        return { label: "Completed", color: "bg-gray-500" };
      default:
        return { label: "Pending", color: "bg-gray-400" };
    }
  };

  const statusConfig = getStatusConfig(adaptedCycle.status ?? "pending");
  const pricePerShare = adaptedCycle.pricePerShare;

  return (
    <>
      <StickyInvestmentBar cycle={adaptedCycle} />

      <div className="min-h-screen pb-24 lg:pb-8">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
          {/* Desktop Two-Column Layout */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8">
            {/* Left Column - Main Content */}
            <div className="lg:col-span-7 space-y-6">
              {/* Hero Section */}
              <Card className="border-2">
                <CardHeader className="space-y-4">
                  <Badge className={`${statusConfig.color} text-white w-fit`}>
                    {statusConfig.label}
                  </Badge>
                  <div>
                    <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold mb-2">
                      {adaptedCycle.name}
                    </h1>
                    <p className="text-xl sm:text-2xl font-semibold bg-gradient-to-r from-emerald-600 to-green-600 bg-clip-text text-transparent">
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
                    {/* Investment Window */}
                    <div className="flex items-start gap-4">
                      <div className="h-12 w-12 rounded-lg bg-emerald-100 dark:bg-emerald-900 flex items-center justify-center flex-shrink-0">
                        <Calendar className="h-6 w-6 text-emerald-600 dark:text-emerald-400" />
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">
                          Investment Window
                        </p>
                        <p className="font-semibold">
                          {adaptedCycle.startDate
                            ? format(new Date(adaptedCycle.startDate), "MMM dd")
                            : "N/A"}{" "}
                          -{" "}
                          {adaptedCycle.endDate
                            ? format(new Date(adaptedCycle.endDate), "MMM dd, yyyy")
                            : "N/A"}
                        </p>
                      </div>
                    </div>

                    {/* Duration */}
                    <div className="flex items-start gap-4">
                      <div className="h-12 w-12 rounded-lg bg-blue-100 dark:bg-blue-900 flex items-center justify-center flex-shrink-0">
                        <Clock className="h-6 w-6 text-blue-600 dark:text-blue-400" />
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">
                          Duration
                        </p>
                        <p className="font-semibold">
                          {adaptedCycle.startDate && adaptedCycle.endDate
                            ? (() => {
                                const start = new Date(adaptedCycle.startDate);
                                const end = new Date(adaptedCycle.endDate);
                                const diffTime = Math.abs(end.getTime() - start.getTime());
                                const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
                                const weeks = Math.floor(diffDays / 7);
                                const months = Math.floor(diffDays / 30);
                                if (months > 0) return `${months} Month${months > 1 ? "s" : ""}`;
                                if (weeks > 0) return `${weeks} Week${weeks > 1 ? "s" : ""}`;
                                return `${diffDays} Day${diffDays > 1 ? "s" : ""}`;
                              })()
                            : "N/A"}
                        </p>
                      </div>
                    </div>

                    {/* Maturity Date */}
                    <div className="flex items-start gap-4">
                      <div className="h-12 w-12 rounded-lg bg-purple-100 dark:bg-purple-900 flex items-center justify-center flex-shrink-0">
                        <Target className="h-6 w-6 text-purple-600 dark:text-purple-400" />
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">
                          Maturity Date
                        </p>
                        <p className="font-semibold">
                          {adaptedCycle.endDate
                            ? format(new Date(adaptedCycle.endDate), "MMMM dd, yyyy")
                            : "N/A"}
                        </p>
                      </div>
                    </div>

                    {/* Projected Allocation */}
                    <div className="flex items-start gap-4">
                      <div className="h-12 w-12 rounded-lg bg-orange-100 dark:bg-orange-900 flex items-center justify-center flex-shrink-0">
                        <Briefcase className="h-6 w-6 text-orange-600 dark:text-orange-400" />
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">
                          Projected Allocation
                        </p>
                        <p className="font-semibold">Import/Export Ventures</p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Investment Overview */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-2xl">
                    Investment Overview
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <p className="text-base leading-relaxed">
                    Funds from this cycle will be primarily allocated to our
                    high-yield electronics import business ahead of the holiday
                    season. Strategic opportunities exist in smartphone
                    accessories and consumer electronics markets, which
                    historically show strong demand during this period.
                  </p>
                  <p className="text-base leading-relaxed">
                    Managed by experienced committee members, this cycle
                    represents a carefully curated portfolio of ventures with
                    strict due diligence.
                  </p>
                  <p className="text-base leading-relaxed">
                    Profits are distributed via our 80/20 split model: 80% to
                    investors and 20% to organizational growth.
                  </p>
                </CardContent>
              </Card>

              {/* How It Works */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-2xl">How It Works</CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  {[1, 2, 3].map((step) => (
                    <div key={step} className="flex items-start gap-4">
                      <div className="h-10 w-10 rounded-full bg-emerald-500 text-white flex items-center justify-center font-bold flex-shrink-0">
                        {step}
                      </div>
                      <div>
                        {step === 1 && (
                          <>
                            <h4 className="font-semibold mb-1">
                              Purchase Shares
                            </h4>
                            <p className="text-sm text-muted-foreground">
                              Invest during the open window by purchasing shares
                              at {formatCurrency(pricePerShare)} per
                              share.
                            </p>
                          </>
                        )}
                        {step === 2 && (
                          <>
                            <h4 className="font-semibold mb-1">
                              Capital Deployment
                            </h4>
                            <p className="text-sm text-muted-foreground">
                              Capital is allocated to vetted business ventures
                              across profitable sectors.
                            </p>
                          </>
                        )}
                        {step === 3 && (
                          <>
                            <h4 className="font-semibold mb-1">
                              Profit Distribution
                            </h4>
                            <p className="text-sm text-muted-foreground">
                              At the end of the cycle, your proportional share
                              of the 80% investor profit pool is credited to
                              your wallet.
                            </p>
                          </>
                        )}
                      </div>
                    </div>
                  ))}
                </CardContent>
              </Card>

              {/* Risk Disclosure */}
              <Card className="border-amber-200 bg-amber-50/50 dark:bg-amber-950/20">
                <CardHeader>
                  <div className="flex items-center gap-2">
                    <Shield className="h-5 w-5 text-amber-600" />
                    <CardTitle className="text-xl">
                      Important Information
                    </CardTitle>
                  </div>
                </CardHeader>
                <CardContent className="space-y-2 text-sm">
                  <p>
                    • All investments carry inherent risks. Past performance
                    does not guarantee future results.
                  </p>
                  <p>
                    • Capital is deployed in real business ventures with varying
                    levels of success.
                  </p>
                  <p>
                    • Profit distributions depend on actual business performance
                    and may vary from projections.
                  </p>
                  <p>
                    • Only invest amounts you can afford for the full cycle
                    duration.
                  </p>
                </CardContent>
              </Card>
            </div>

            {/* Right Column - Desktop Summary */}
            <div className="hidden lg:block lg:col-span-5">
              <div className="sticky top-6">
                <CycleSummaryCard cycle={adaptedCycle} />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Mobile Summary */}
      <div className="lg:hidden container mx-auto px-4 pb-6">
        <CycleSummaryCard cycle={adaptedCycle} />
      </div>

      <FloatingInvestmentFooter cycle={adaptedCycle} />
    </>
  );
};

const CycleDetailsPage = ({ params }: CycleDetailsPageProps) => {
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
};

export default CycleDetailsPage;