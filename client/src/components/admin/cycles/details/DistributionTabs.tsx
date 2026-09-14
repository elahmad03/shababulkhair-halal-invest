"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { CycleDetails } from "@/lib/types/cycle";
import { toast } from "sonner";
import { formatCurrency } from "@/lib/utils";
import {
  useDistributeProfitMutation,
  useUpdateCycleStatusMutation,
} from "@/store/modules/cycle/cycleApi";
import { Loader2, CheckCircle2 } from "lucide-react";

interface DistributionTabProps {
  cycleData: CycleDetails;
}

export function DistributionTab({ cycleData }: DistributionTabProps) {
  const [investorPercentage, setInvestorPercentage] = useState("80");
  const [notes, setNotes] = useState("");
  const [confirmDistribution, setConfirmDistribution] = useState(false);

  const [distributeProfit, { isLoading: isDistributing }] = useDistributeProfitMutation();
  const [updateCycleStatus, { isLoading: isCompleting }] = useUpdateCycleStatusMutation();

  const status = (cycleData.rawStatus || cycleData.status || "").toUpperCase();
  const isDistributed = cycleData.profitDistributionStatus === "COMPLETED";

  // Profit calculations
  const totalProfitKobo = Number(cycleData.profitRealized);
  const totalProfitNaira = totalProfitKobo / 100;
  const pct = parseFloat(investorPercentage) || 0;
  const investorPoolNaira = (totalProfitNaira * pct) / 100;
  const orgShareNaira = totalProfitNaira - investorPoolNaira;

  const handleDistributeProfit = async () => {
    if (pct < 0 || pct > 100) {
      toast.error("Percentage must be between 0 and 100");
      return;
    }

    try {
      await distributeProfit({
        cycleId: cycleData.id,
        body: {
          investorProfitPercentage: pct,
          notes: notes || undefined,
        },
      }).unwrap();
      toast.success("Profits distributed and recorded successfully!");
    } catch (err: any) {
      toast.error(err?.data?.message || "Failed to distribute profit");
    }
  };

  const handleCompleteCycle = async () => {
    try {
      await updateCycleStatus({
        cycleId: cycleData.id,
        body: { status: "COMPLETED" },
      }).unwrap();
      toast.success("Cycle marked as COMPLETED!");
    } catch (err: any) {
      toast.error(err?.data?.message || "Failed to complete cycle");
    }
  };

  // 1. CLOSING Phase — Ready for or Has Distributed Profit
  if (status === "CLOSING") {
    return (
      <div className="space-y-6">
        {!isDistributed ? (
          <Card className="border-amber-200 bg-amber-50/50 dark:bg-amber-950/10">
            <CardHeader>
              <CardTitle className="text-amber-900 dark:text-amber-300">
                Finalize Profit Split
              </CardTitle>
              <CardDescription className="text-amber-700 dark:text-amber-400">
                Cycle is in CLOSING phase. Set the investor / organization split ratio before completing the cycle.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 p-4 bg-background rounded-lg border">
                <div>
                  <Label className="text-xs text-muted-foreground">Total Realized Profit</Label>
                  <p className="text-2xl font-bold text-foreground">
                    {formatCurrency(totalProfitNaira)}
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">
                    Sum of realized profits across all ventures
                  </p>
                </div>
                <div>
                  <Label htmlFor="investorPercentage" className="text-xs text-muted-foreground">
                    Investor Share Percentage (%)
                  </Label>
                  <Input
                    id="investorPercentage"
                    type="number"
                    min="0"
                    max="100"
                    value={investorPercentage}
                    onChange={(e) => setInvestorPercentage(e.target.value)}
                    className="mt-1 font-semibold"
                  />
                </div>
              </div>

              {/* Resolved Split Projection */}
              <div className="grid grid-cols-2 gap-4 p-4 bg-muted/60 rounded-lg border">
                <div>
                  <Label className="text-xs text-muted-foreground">
                    Investors Pool ({pct}%)
                  </Label>
                  <p className="text-xl font-bold text-emerald-600">
                    {formatCurrency(investorPoolNaira)}
                  </p>
                </div>
                <div>
                  <Label className="text-xs text-muted-foreground">
                    Organization Share ({100 - pct}%)
                  </Label>
                  <p className="text-xl font-bold text-blue-600">
                    {formatCurrency(orgShareNaira)}
                  </p>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="distNotes">Admin Notes (Optional)</Label>
                <Input
                  id="distNotes"
                  placeholder="e.g. Approved 80/20 split based on Q3 committee resolution"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                />
              </div>

              <div className="flex items-center space-x-2">
                <Checkbox
                  id="confirm"
                  checked={confirmDistribution}
                  onCheckedChange={(checked) => setConfirmDistribution(Boolean(checked))}
                />
                <Label
                  htmlFor="confirm"
                  className="text-sm font-medium leading-none cursor-pointer"
                >
                  I confirm the profit split is correct. This calculation is irreversible.
                </Label>
              </div>

              <Button
                className="w-full bg-emerald-600 hover:bg-emerald-700 text-white"
                size="lg"
                disabled={!confirmDistribution || isDistributing}
                onClick={handleDistributeProfit}
              >
                {isDistributing && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Distribute Profits to Shareholders
              </Button>
            </CardContent>
          </Card>
        ) : (
          <Card className="border-green-200 bg-green-50/50 dark:bg-green-950/10">
            <CardHeader>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="h-5 w-5 text-green-600" />
                <CardTitle className="text-green-900 dark:text-green-300">
                  Profit Distribution Recorded
                </CardTitle>
              </div>
              <CardDescription className="text-green-700 dark:text-green-400">
                Shareholder profits have been credited. You can now complete the cycle.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-3 gap-4 p-4 bg-background rounded-lg border">
                <div>
                  <Label className="text-xs text-muted-foreground">Total Realized</Label>
                  <p className="text-lg font-bold">
                    {formatCurrency(Number(cycleData.profitRealized) / 100)}
                  </p>
                </div>
                <div>
                  <Label className="text-xs text-muted-foreground">Investor Pool</Label>
                  <p className="text-lg font-bold text-emerald-600">
                    {formatCurrency(Number(cycleData.investorPool) / 100)}
                  </p>
                </div>
                <div>
                  <Label className="text-xs text-muted-foreground">Organization Share</Label>
                  <p className="text-lg font-bold text-blue-600">
                    {formatCurrency(Number(cycleData.organizationalShare) / 100)}
                  </p>
                </div>
              </div>

              <Button
                className="w-full bg-blue-600 hover:bg-blue-700 text-white"
                size="lg"
                disabled={isCompleting}
                onClick={handleCompleteCycle}
              >
                {isCompleting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Finalize & Mark Cycle as COMPLETED
              </Button>
            </CardContent>
          </Card>
        )}
      </div>
    );
  }

  // 2. COMPLETED Phase — Final Record
  if (status === "COMPLETED") {
    return (
      <Card className="border-green-200 bg-green-50/50 dark:bg-green-950/10">
        <CardHeader>
          <CardTitle className="text-green-900 dark:text-green-300">
            Distribution Summary
          </CardTitle>
          <CardDescription className="text-green-700 dark:text-green-400">
            Final settled profit distribution record for this completed cycle.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 p-4 bg-background rounded-lg border">
            <div>
              <Label className="text-xs text-muted-foreground">Total Profit Realized</Label>
              <p className="text-xl font-bold text-foreground">
                {formatCurrency(Number(cycleData.profitRealized) / 100)}
              </p>
            </div>
            <div>
              <Label className="text-xs text-muted-foreground">Investor Pool</Label>
              <p className="text-xl font-bold text-emerald-600">
                {formatCurrency(Number(cycleData.investorPool) / 100)}
              </p>
            </div>
            <div>
              <Label className="text-xs text-muted-foreground">Organizational Share</Label>
              <p className="text-xl font-bold text-blue-600">
                {formatCurrency(Number(cycleData.organizationalShare) / 100)}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  // 3. PENDING, OPEN, or ACTIVE Phase
  return (
    <Card className="border-slate-200">
      <CardContent className="py-12 text-center text-muted-foreground space-y-2">
        <p className="text-base font-medium text-foreground">
          Profit distribution is not available in {status} status.
        </p>
        <p className="text-sm">
          Profit distribution controls will become active once the cycle moves to the{" "}
          <strong className="text-foreground">CLOSING</strong> window.
        </p>
      </CardContent>
    </Card>
  );
}