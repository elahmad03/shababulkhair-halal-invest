// components/admin/cycles/distribute-profit-dialog.tsx
"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { AlertCircle } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { formatCurrency } from "@/lib/utils";

interface Cycle {
  id: string;
  name: string;
  status: string;
  totalInvested: number;
  investors: number;
}

interface DistributeProfitDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  cycle: Cycle;
}

export function DistributeProfitDialog({
  open,
  onOpenChange,
  cycle,
}: DistributeProfitDialogProps) {
  const [totalProfit, setTotalProfit] = useState("");

  const handleDistribute = () => {
    // TODO: Implement profit distribution logic
    console.log(`Distributing ${totalProfit} profit for cycle:`, cycle.id);
    onOpenChange(false);
    setTotalProfit("");
  };

  // const formatCurrency = (amount: number) => {
  //   return new Intl.NumberFormat("en-NG", {
  //     style: "currency",
  //     currency: "NGN",
  //     minimumFractionDigits: 0,
  //   }).format(amount);
  // };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold">
            Close & Distribute Profit
          </DialogTitle>
          <DialogDescription>
            Enter the total profit realized to close the cycle and automatically
            distribute profits to all investors.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {/* Cycle Summary */}
          <div className="rounded-lg border border-slate-200 bg-slate-50 p-4 space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-slate-600">Cycle:</span>
              <span className="font-semibold text-slate-900">{cycle.name}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-slate-600">Total Invested:</span>
              <span className="font-semibold text-slate-900">
                {formatCurrency(cycle.totalInvested)}
              </span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-slate-600">Total Investors:</span>
              <span className="font-semibold text-slate-900">{cycle.investors}</span>
            </div>
          </div>

          {/* Profit Input */}
          <div className="grid gap-2">
            <Label htmlFor="total-profit">Total Profit Realized (₦)</Label>
            <Input
              id="total-profit"
              type="number"
              placeholder="Enter total profit amount"
              value={totalProfit}
              onChange={(e) => setTotalProfit(e.target.value)}
              className="text-lg"
            />
          </div>

          {/* Warning */}
          <Alert>
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              This action will close the cycle and automatically calculate and
              distribute profits to all investors based on their investment amounts.
              This action cannot be undone.
            </AlertDescription>
          </Alert>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button
            onClick={handleDistribute}
            disabled={!totalProfit || parseFloat(totalProfit) <= 0}
            className="bg-gradient-to-r from-emerald-600 to-green-500 text-white shadow-md hover:shadow-lg"
          >
            Confirm & Distribute
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}