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

export function CreateCycleDialog() {
  const [open, setOpen] = useState(false);
  const [cycleName, setCycleName] = useState("");
  const [startDate, setStartDate] = useState<Date>();
  const [endDate, setEndDate] = useState<Date>();
  const [pricePerShare, setPricePerShare] = useState("");
  const [description, setDescription] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    // TODO: Implement API call to create cycle
    console.log({
      cycleName,
      startDate,
      endDate,
      pricePerShare: BigInt(Number(pricePerShare) * 100), // Convert to kobo
      description,
    });

    // Reset form and close dialog
    setTimeout(() => {
      setIsSubmitting(false);
      setOpen(false);
      resetForm();
    }, 1000);
  };

  const resetForm = () => {
    setCycleName("");
    setStartDate(undefined);
    setEndDate(undefined);
    setPricePerShare("");
    setDescription("");
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button size="lg" className="w-full sm:w-auto">
          <Plus className="mr-2 h-4 w-4" />
          Create New Cycle
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[500px]">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>Create New Investment Cycle</DialogTitle>
            <DialogDescription>
              Define the parameters for a new investment cycle. The cycle will be
              created in pending status.
            </DialogDescription>
          </DialogHeader>

          <div className="grid gap-4 py-4">
            {/* Cycle Name */}
            <div className="grid gap-2">
              <Label htmlFor="cycleName">Cycle Name</Label>
              <Input
                id="cycleName"
                placeholder="e.g., November 2025 Cycle"
                value={cycleName}
                onChange={(e) => setCycleName(e.target.value)}
                required
              />
            </div>

            {/* Date Range */}
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label>Start Date</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className={cn(
                        "justify-start text-left font-normal",
                        !startDate && "text-muted-foreground"
                      )}
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {startDate ? format(startDate, "PPP") : "Pick date"}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="single"
                      selected={startDate}
                      onSelect={setStartDate}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
              </div>

              <div className="grid gap-2">
                <Label>End Date</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className={cn(
                        "justify-start text-left font-normal",
                        !endDate && "text-muted-foreground"
                      )}
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {endDate ? format(endDate, "PPP") : "Pick date"}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="single"
                      selected={endDate}
                      onSelect={setEndDate}
                      disabled={(date) =>
                        startDate ? date < startDate : false
                      }
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
              </div>
            </div>

            {/* Price Per Share */}
            <div className="grid gap-2">
              <Label htmlFor="pricePerShare">Price Per Share (NGN)</Label>
              <Input
                id="pricePerShare"
                type="number"
                placeholder="10000"
                value={pricePerShare}
                onChange={(e) => setPricePerShare(e.target.value)}
                required
                min="0"
                step="0.01"
              />
              {pricePerShare && (
                <p className="text-xs text-muted-foreground">
                  Display: {formatCurrency(BigInt(Number(pricePerShare) * 100))}
                </p>
              )}
            </div>

            {/* Description */}
            <div className="grid gap-2">
              <Label htmlFor="description">Description (Optional)</Label>
              <Input
                id="description"
                placeholder="Describe this investment cycle..."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
              />
            </div>
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => setOpen(false)}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? "Creating..." : "Save Cycle"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}