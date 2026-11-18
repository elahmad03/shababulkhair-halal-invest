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

  // Parse and strictly validate percentage input with basis-point precision (max 2 decimal places)
  const totalProfitKobo = BigInt(cycleData.profitRealized || 0n);
  const parsedPct = parseFloat(investorPercentage);
  const decimalParts = investorPercentage.trim().split(".");
  const hasValidPrecision = !decimalParts[1] || decimalParts[1].length <= 2;
  const isValidPct =
    investorPercentage.trim() !== "" &&
    !isNaN(parsedPct) &&
    isFinite(parsedPct) &&
    parsedPct >= 0 &&
    parsedPct <= 100 &&
    hasValidPrecision;

  // Projections: compute only when percentage and precision are valid; matches server basis points (1 bp = 0.01%)
  const investorBps = isValidPct ? BigInt(Math.round(parsedPct * 100)) : 0n;
  const investorPoolKobo = isValidPct ? (totalProfitKobo * investorBps) / 10000n : 0n;
  const orgShareKobo = isValidPct ? totalProfitKobo - investorPoolKobo : 0n;

  const handleDistributeProfit = async () => {
    const rawPct = parseFloat(investorPercentage);
    const decimals = investorPercentage.trim().split(".")[1];

    if (
      investorPercentage.trim() === "" ||
      isNaN(rawPct) ||
      !isFinite(rawPct) ||
      rawPct < 0 ||
      rawPct > 100
    ) {
      toast.error("Percentage must be a valid number between 0 and 100");
      return;
    }

    if (decimals && decimals.length > 2) {
      toast.error("Percentage precision cannot exceed 2 decimal places (basis points)");
      return;
    }

    // Submit the exact normalized 2-decimal percentage matching the preview and DB Decimal(5,2)
    const normalizedPct = Number(rawPct.toFixed(2));

    try {
      await distributeProfit({
        cycleId: cycleData.id,
        body: {
          investorProfitPercentage: normalizedPct,
          notes: notes.trim() || undefined,
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
          <Card className="border bg-card text-card-foreground">
            <CardHeader>
              <CardTitle className="text-foreground">
                Finalize Profit Split
              </CardTitle>
              <CardDescription className="text-muted-foreground">
                Cycle is in CLOSING phase. Set the investor / organization split ratio before completing the cycle.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 p-4 bg-muted/40 rounded-lg border">
                <div>
                  <Label className="text-xs text-muted-foreground">Total Realized Profit</Label>
                  <p className="text-2xl font-bold text-foreground">
                    {formatCurrency(totalProfitKobo)}
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
                    step="0.01"
                    value={investorPercentage}
                    onChange={(e) => setInvestorPercentage(e.target.value)}
                    className="mt-1 font-semibold"
                  />
                  {!isValidPct && (
                    <p className="text-xs text-destructive mt-1">
                      {!hasValidPrecision
                        ? "Percentage cannot exceed 2 decimal places (basis points e.g. 80.25)"
                        : "Percentage must be a valid number between 0 and 100"}
                    </p>
                  )}
                </div>
              </div>

              {/* Resolved Split Projection */}
              <div className="grid grid-cols-2 gap-4 p-4 bg-muted/60 rounded-lg border">
                <div>
                  <Label className="text-xs text-muted-foreground">
                    Investors Pool {isValidPct ? `(${parsedPct.toFixed(2)}%)` : ""}
                  </Label>
                  <p className="text-xl font-bold text-primary">
                    {isValidPct ? formatCurrency(investorPoolKobo) : "—"}
                  </p>
                </div>
                <div>
                  <Label className="text-xs text-muted-foreground">
                    Organization Share {isValidPct ? `(${(100 - parsedPct).toFixed(2)}%)` : ""}
                  </Label>
                  <p className="text-xl font-bold text-foreground">
                    {isValidPct ? formatCurrency(orgShareKobo) : "—"}
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
                className="w-full"
                size="lg"
                disabled={!confirmDistribution || isDistributing || !isValidPct}
                onClick={handleDistributeProfit}
              >
                {isDistributing && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Distribute Profits to Shareholders
              </Button>
            </CardContent>
          </Card>
        ) : (
          <Card className="border bg-card text-card-foreground">
            <CardHeader>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="h-5 w-5 text-primary" />
                <CardTitle className="text-foreground">
                  Profit Distribution Recorded
                </CardTitle>
              </div>
              <CardDescription className="text-muted-foreground">
                Shareholder profits have been credited. You can now complete the cycle.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-3 gap-4 p-4 bg-muted/40 rounded-lg border">
                <div>
                  <Label className="text-xs text-muted-foreground">Total Realized</Label>
                  <p className="text-lg font-bold text-foreground">
                    {formatCurrency(cycleData.profitRealized)}
                  </p>
                </div>
                <div>
                  <Label className="text-xs text-muted-foreground">Investor Pool</Label>
                  <p className="text-lg font-bold text-primary">
                    {formatCurrency(cycleData.investorPool)}
                  </p>
                </div>
                <div>
                  <Label className="text-xs text-muted-foreground">Organization Share</Label>
                  <p className="text-lg font-bold text-foreground">
                    {formatCurrency(cycleData.organizationalShare)}
                  </p>
                </div>
              </div>

              <Button
                className="w-full"
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
      <Card className="border bg-card text-card-foreground">
        <CardHeader>
          <CardTitle className="text-foreground">
            Distribution Summary
          </CardTitle>
          <CardDescription className="text-muted-foreground">
            Final settled profit distribution record for this completed cycle.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 p-4 bg-muted/40 rounded-lg border">
            <div>
              <Label className="text-xs text-muted-foreground">Total Profit Realized</Label>
              <p className="text-xl font-bold text-foreground">
                {formatCurrency(cycleData.profitRealized)}
              </p>
            </div>
            <div>
              <Label className="text-xs text-muted-foreground">Investor Pool</Label>
              <p className="text-xl font-bold text-primary">
                {formatCurrency(cycleData.investorPool)}
              </p>
            </div>
            <div>
              <Label className="text-xs text-muted-foreground">Organizational Share</Label>
              <p className="text-xl font-bold text-foreground">
                {formatCurrency(cycleData.organizationalShare)}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  // 3. PENDING, OPEN, or ACTIVE Phase
  return (
    <Card className="border bg-card text-card-foreground">
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
