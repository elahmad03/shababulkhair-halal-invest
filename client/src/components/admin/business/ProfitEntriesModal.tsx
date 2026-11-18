"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Loader2, TrendingUp, Calendar, User, FileText, Plus } from "lucide-react";
import { formatCurrency } from "@/lib/utils";
import { toast } from "sonner";
import {
  useGetProfitEntriesQuery,
  useCreateProfitEntryMutation,
} from "@/store/modules/venture/ventureApi";
import type { Venture } from "@/store/modules/venture/venture.types";

interface ProfitEntriesModalProps {
  venture: Venture | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess?: () => void;
}

export const ProfitEntriesModal = ({
  venture,
  open,
  onOpenChange,
  onSuccess,
}: ProfitEntriesModalProps) => {
  const [showAddForm, setShowAddForm] = useState(false);
  const [amountNaira, setAmountNaira] = useState("");
  const [note, setNote] = useState("");
  const [formError, setFormError] = useState<string | null>(null);

  const {
    data: entriesData,
    isLoading: isLoadingEntries,
    refetch,
  } = useGetProfitEntriesQuery(venture?.id || "", {
    skip: !venture || !open,
  });

  const [createProfitEntry, { isLoading: isSubmitting }] = useCreateProfitEntryMutation();

  if (!venture) return null;

  const entries = entriesData?.data || [];
  const totalRealizedKobo = BigInt(venture.profitRealizedKobo || "0");
  const expectedProfitKobo = BigInt(venture.expectedProfitKobo || "0");

  const handleAddEntry = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);

    const parsedNaira = parseFloat(amountNaira);
    if (isNaN(parsedNaira) || parsedNaira <= 0) {
      setFormError("Please enter a valid profit amount greater than ₦0");
      return;
    }

    try {
      await createProfitEntry({
        ventureId: venture.id,
        amountNaira: parsedNaira,
        note: note.trim() || undefined,
      }).unwrap();

      toast.success("Profit installment recorded successfully", {
        description: `Added ${formatCurrency(BigInt(Math.round(parsedNaira * 100)))} to ${venture.companyName}`,
      });

      setAmountNaira("");
      setNote("");
      setShowAddForm(false);
      refetch();
      onSuccess?.();
    } catch (err: any) {
      const msg = err?.data?.message || "Failed to record profit entry";
      setFormError(msg);
      toast.error(msg);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg max-h-[85vh] flex flex-col">
        <DialogHeader>
          <div className="flex items-center gap-2">
            <div className="h-9 w-9 rounded-full bg-primary/10 flex items-center justify-center text-primary">
              <TrendingUp className="h-5 w-5" />
            </div>
            <div>
              <DialogTitle>Profit Entries</DialogTitle>
              <DialogDescription>
                {venture.companyName}
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        {/* Venture Summary Metrics */}
        <div className="grid grid-cols-2 gap-3 p-3 rounded-lg bg-muted/40 border border-border text-sm">
          <div>
            <p className="text-xs text-muted-foreground">Expected Profit</p>
            <p className="font-semibold text-foreground">
              {formatCurrency(expectedProfitKobo)}
            </p>
          </div>
          <div>
            <p className="text-xs text-muted-foreground">Total Realized Profit</p>
            <p className="font-semibold text-primary">
              {formatCurrency(totalRealizedKobo)}
            </p>
          </div>
        </div>

        {/* Action Toggle */}
        <div className="flex justify-between items-center pt-2">
          <span className="text-sm font-medium">Recorded Installments ({entries.length})</span>
          {!showAddForm && (
            <Button
              size="sm"
              variant="outline"
              onClick={() => setShowAddForm(true)}
              className="gap-1.5 h-8 text-xs"
            >
              <Plus className="h-3.5 w-3.5" />
              Add Profit Installment
            </Button>
          )}
        </div>

        {/* Add Profit Form */}
        {showAddForm && (
          <form
            onSubmit={handleAddEntry}
            className="rounded-lg border border-primary/20 bg-primary/5 p-4 space-y-3"
          >
            <div className="flex justify-between items-center">
              <h4 className="text-xs font-semibold uppercase tracking-wider text-primary">
                New Profit Entry
              </h4>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => {
                  setShowAddForm(false);
                  setFormError(null);
                }}
                className="h-6 text-xs text-muted-foreground hover:text-foreground"
              >
                Cancel
              </Button>
            </div>

            <div className="space-y-1">
              <Label htmlFor="amountNaira" className="text-xs">
                Profit Amount (₦ Naira)
              </Label>
              <Input
                id="amountNaira"
                type="number"
                step="any"
                min="1"
                placeholder="e.g. 50000"
                value={amountNaira}
                onChange={(e) => {
                  setAmountNaira(e.target.value);
                  if (formError) setFormError(null);
                }}
                disabled={isSubmitting}
                required
              />
            </div>

            <div className="space-y-1">
              <Label htmlFor="note" className="text-xs">
                Note / Description (Optional)
              </Label>
              <Textarea
                id="note"
                rows={2}
                placeholder="e.g. Q1 commercial trading distribution"
                value={note}
                onChange={(e) => setNote(e.target.value)}
                disabled={isSubmitting}
              />
            </div>

            {formError && <p className="text-xs text-destructive">{formError}</p>}

            <div className="flex justify-end gap-2 pt-1">
              <Button
                type="submit"
                size="sm"
                disabled={isSubmitting}
                className="gap-1.5"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="h-3.5 w-3.5 animate-spin" />
                    Recording...
                  </>
                ) : (
                  "Record Profit"
                )}
              </Button>
            </div>
          </form>
        )}

        {/* Entries List */}
        <div className="flex-1 overflow-y-auto space-y-2 pr-1 min-h-[160px]">
          {isLoadingEntries ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="h-6 w-6 animate-spin text-primary" />
            </div>
          ) : entries.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground text-sm">
              <TrendingUp className="h-8 w-8 mx-auto mb-2 opacity-40" />
              <p>No profit entries recorded yet.</p>
              <p className="text-xs mt-1">Committee members and admins can log profit installments as they arrive.</p>
            </div>
          ) : (
            entries.map((entry) => (
              <div
                key={entry.id}
                className="p-3 rounded-lg border border-border bg-card hover:bg-muted/30 transition-colors text-sm space-y-1.5"
              >
                <div className="flex justify-between items-center">
                  <span className="font-semibold text-primary">
                    +{formatCurrency(BigInt(entry.amountKobo))}
                  </span>
                  <span className="text-xs text-muted-foreground flex items-center gap-1">
                    <Calendar className="h-3 w-3" />
                    {new Date(entry.createdAt).toLocaleDateString("en-US", {
                      year: "numeric",
                      month: "short",
                      day: "numeric",
                    })}
                  </span>
                </div>
                {entry.note && (
                  <p className="text-xs text-foreground/90 flex items-start gap-1">
                    <FileText className="h-3 w-3 mt-0.5 text-muted-foreground shrink-0" />
                    <span>{entry.note}</span>
                  </p>
                )}
                {entry.recordedBy && (
                  <p className="text-[11px] text-muted-foreground flex items-center gap-1">
                    <User className="h-3 w-3" />
                    Recorded by {entry.recordedBy.firstName} {entry.recordedBy.lastName}
                    {entry.recordedBy.role && ` (${entry.recordedBy.role})`}
                  </p>
                )}
              </div>
            ))
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ProfitEntriesModal;
