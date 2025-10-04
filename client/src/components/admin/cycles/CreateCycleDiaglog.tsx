// components/admin/cycles/create-cycle-dialog.tsx
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
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { CalendarIcon } from "lucide-react";
import { format } from "date-fns";
import { cn } from "@/lib/utils";

interface CreateCycleDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function CreateCycleDialog({ open, onOpenChange }: CreateCycleDialogProps) {
  const [cycleName, setCycleName] = useState("");
  const [startDate, setStartDate] = useState<Date>();
  const [endDate, setEndDate] = useState<Date>();
  const [duration, setDuration] = useState("");
  const [sharePrice, setSharePrice] = useState("");

  const handleSave = () => {
    // TODO: Implement save logic
    console.log({ cycleName, startDate, endDate, duration, sharePrice });
    onOpenChange(false);
  };

  const handleCancel = () => {
    // Reset form
    setCycleName("");
    setStartDate(undefined);
    setEndDate(undefined);
    setDuration("");
    setSharePrice("");
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold">Create New Cycle</DialogTitle>
          <DialogDescription>
            Set up a new investment cycle with all the necessary details.
          </DialogDescription>
        </DialogHeader>

        <div className="grid gap-6 py-4">
          {/* Cycle Name */}
          <div className="grid gap-2">
            <Label htmlFor="cycle-name">Cycle Name</Label>
            <Input
              id="cycle-name"
              placeholder="e.g., November 2025 Cycle"
              value={cycleName}
              onChange={(e) => setCycleName(e.target.value)}
            />
          </div>

          {/* Investment Window */}
          <div className="grid gap-4">
            <Label>Investment Window</Label>
            <div className="grid grid-cols-2 gap-4">
              {/* Start Date */}
              <div className="grid gap-2">
                <Label htmlFor="start-date" className="text-sm text-slate-600">
                  Start Date
                </Label>
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
                      {startDate ? format(startDate, "PPP") : "Pick a date"}
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

              {/* End Date */}
              <div className="grid gap-2">
                <Label htmlFor="end-date" className="text-sm text-slate-600">
                  End Date
                </Label>
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
                      {endDate ? format(endDate, "PPP") : "Pick a date"}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="single"
                      selected={endDate}
                      onSelect={setEndDate}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
              </div>
            </div>
          </div>

          {/* Cycle Duration */}
          <div className="grid gap-2">
            <Label htmlFor="duration">Cycle Duration</Label>
            <Input
              id="duration"
              placeholder="e.g., 3 Months"
              value={duration}
              onChange={(e) => setDuration(e.target.value)}
            />
          </div>

          {/* Share Price */}
          <div className="grid gap-2">
            <Label htmlFor="share-price">Share Price (₦)</Label>
            <Input
              id="share-price"
              type="number"
              placeholder="e.g., 10000"
              value={sharePrice}
              onChange={(e) => setSharePrice(e.target.value)}
            />
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={handleCancel}>
            Cancel
          </Button>
          <Button
            onClick={handleSave}
            className="bg-gradient-to-r from-emerald-600 to-green-500 text-white shadow-md hover:shadow-lg"
          >
            Save Draft
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}