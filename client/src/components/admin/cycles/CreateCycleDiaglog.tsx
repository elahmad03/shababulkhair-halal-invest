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
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { CalendarIcon, Plus } from "lucide-react";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import { formatCurrency } from "@/lib/utils";
import { useCreateCycleMutation } from "@/store/modules/cycle/cycleApi";
import { toast } from "sonner";

export function CreateCycleDialog() {
  const [createCycle, { isLoading }] = useCreateCycleMutation();

  const [open, setOpen] = useState(false);
  const [cycleName, setCycleName] = useState("");
  const [pricePerShare, setPricePerShare] = useState("");
  const [description, setDescription] = useState("");

  // New 4-stage timeline state
  const [fundingOpensAt, setFundingOpensAt] = useState<Date>();
  const [fundingClosesAt, setFundingClosesAt] = useState<Date>();
  const [activeStartsAt, setActiveStartsAt] = useState<Date>();
  const [activeEndsAt, setActiveEndsAt] = useState<Date>();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      await createCycle({
        cycleName: cycleName.trim(),
        pricePerShareNaira: pricePerShare ? Number(pricePerShare) : 10000,
        fundingOpensAt: fundingOpensAt?.toISOString(),
        fundingClosesAt: fundingClosesAt?.toISOString(),
        activeStartsAt: activeStartsAt?.toISOString(),
        activeEndsAt: activeEndsAt?.toISOString(),
        description: description.trim() || undefined,
      }).unwrap();

      toast.success("Investment cycle created successfully");
      setOpen(false);
      resetForm();
    } catch (err: any) {
      toast.error(err?.data?.message || "Failed to create cycle");
      console.error("Create cycle failed:", err);
    }
  };

  const resetForm = () => {
    setCycleName("");
    setPricePerShare("");
    setDescription("");
    setFundingOpensAt(undefined);
    setFundingClosesAt(undefined);
    setActiveStartsAt(undefined);
    setActiveEndsAt(undefined);
  };

  // Helper for cleaner semantic date pickers
  const DatePickerField = ({
    label,
    date,
    setDate,
    disabledDays,
  }: {
    label: string;
    date: Date | undefined;
    setDate: (d: Date | undefined) => void;
    disabledDays?: (date: Date) => boolean;
  }) => (
    <div className="grid gap-2">
      <Label>{label}</Label>
      <Popover>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            className={cn(
              "w-full justify-start text-left font-normal",
              !date && "text-muted-foreground"
            )}
          >
            <CalendarIcon className="mr-2 h-4 w-4" />
            {date ? format(date, "PPP") : "Pick date"}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-0" align="start">
          <Calendar
            mode="single"
            selected={date}
            onSelect={setDate}
            disabled={disabledDays}
            initialFocus
          />
        </PopoverContent>
      </Popover>
    </div>
  );

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button size="lg" className="w-full sm:w-auto">
          <Plus className="mr-2 h-4 w-4" />
          Create New Cycle
        </Button>
      </DialogTrigger>
      
      {/* Added max height and scroll to handle the expanded form gracefully */}
      <DialogContent className="sm:max-w-[550px] max-h-[90vh] overflow-y-auto">
        <form onSubmit={handleSubmit}>
          <DialogHeader className="mb-4">
            <DialogTitle>Create New Investment Cycle</DialogTitle>
            <DialogDescription>
              Set the timeline and share pricing. Cycles are created in a PENDING status.
            </DialogDescription>
          </DialogHeader>

          <div className="grid gap-6 py-2">
            
            {/* 1. Core Details */}
            <fieldset className="grid gap-4">
              <div className="grid gap-2">
                <Label htmlFor="cycleName">Cycle Name</Label>
                <Input
                  id="cycleName"
                  placeholder="e.g., Q3 2026 Poultry Expansion"
                  value={cycleName}
                  onChange={(e) => setCycleName(e.target.value)}
                  required
                />
              </div>

              <div className="grid gap-2">
                <Label htmlFor="pricePerShare">Price Per Share (₦)</Label>
                <Input
                  id="pricePerShare"
                  type="number"
                  placeholder="10000"
                  value={pricePerShare}
                  onChange={(e) => setPricePerShare(e.target.value)}
                  required
                  min="1"
                  step="0.01"
                />
                {pricePerShare && (
                  <p className="text-xs text-muted-foreground">
                    Display: {formatCurrency(BigInt(Number(pricePerShare) * 100))}
                  </p>
                )}
              </div>
            </fieldset>

            {/* 2. Funding Timeline */}
            <fieldset className="grid gap-4 rounded-lg border p-4 bg-muted/20">
              <legend className="text-sm font-semibold px-2">Funding Window</legend>
              <div className="grid grid-cols-2 gap-4">
                <DatePickerField
                  label="Funding Opens"
                  date={fundingOpensAt}
                  setDate={setFundingOpensAt}
                />
                <DatePickerField
                  label="Funding Closes"
                  date={fundingClosesAt}
                  setDate={setFundingClosesAt}
                  disabledDays={(date) => (fundingOpensAt ? date <= fundingOpensAt : false)}
                />
              </div>
            </fieldset>

            {/* 3. Active Timeline */}
            <fieldset className="grid gap-4 rounded-lg border p-4 bg-muted/20">
              <legend className="text-sm font-semibold px-2">Active Cycle Window</legend>
              <div className="grid grid-cols-2 gap-4">
                <DatePickerField
                  label="Cycle Starts"
                  date={activeStartsAt}
                  setDate={setActiveStartsAt}
                  disabledDays={(date) => (fundingClosesAt ? date <= fundingClosesAt : false)}
                />
                <DatePickerField
                  label="Cycle Ends"
                  date={activeEndsAt}
                  setDate={setActiveEndsAt}
                  disabledDays={(date) => (activeStartsAt ? date <= activeStartsAt : false)}
                />
              </div>
            </fieldset>

            {/* 4. Additional Info */}
            <fieldset className="grid gap-2">
              <Label htmlFor="description">Description (Optional)</Label>
              <Input
                id="description"
                placeholder="Briefly describe the purpose of this cycle..."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
              />
            </fieldset>
            
          </div>

          <DialogFooter className="mt-6">
            <Button
              type="button"
              variant="outline"
              onClick={() => setOpen(false)}
              disabled={isLoading}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? "Creating Cycle..." : "Save Cycle"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}