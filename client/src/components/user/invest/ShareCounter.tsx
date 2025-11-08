"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Minus, Plus } from "lucide-react";

interface ShareCounterProps {
  shares: number;
  onSharesChange: (shares: number) => void;
  minShares?: number;
  maxShares?: number;
}

const ShareCounter = ({
  shares,
  onSharesChange,
  minShares = 1,
  maxShares = 1000,
}: ShareCounterProps) => {
  const handleIncrement = () => {
    if (shares < maxShares) {
      onSharesChange(shares + 1);
    }
  };

  const handleDecrement = () => {
    if (shares > 0) {
      onSharesChange(shares - 1);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = parseInt(e.target.value);
    if (!isNaN(value) && value >= 0 && value <= maxShares) {
      onSharesChange(value);
    } else if (e.target.value === "") {
      onSharesChange(0);
    }
  };

  return (
    <div className="flex items-center justify-center gap-4">
      <Button
        type="button"
        variant="outline"
        size="icon"
        onClick={handleDecrement}
        disabled={shares === 0}
        className="h-14 w-14 rounded-full border-2 hover:bg-emerald-50 hover:border-emerald-500 disabled:opacity-50"
      >
        <Minus className="h-6 w-6" />
      </Button>

      <div className="relative">
        <Input
          type="number"
          value={shares}
          onChange={handleInputChange}
          min={0}
          max={maxShares}
          className="w-32 h-16 text-center text-3xl font-bold border-2 focus:border-emerald-500"
        />
        <span className="absolute -bottom-6 left-1/2 -translate-x-1/2 text-xs text-muted-foreground whitespace-nowrap">
          shares
        </span>
      </div>

      <Button
        type="button"
        variant="outline"
        size="icon"
        onClick={handleIncrement}
        disabled={shares >= maxShares}
        className="h-14 w-14 rounded-full border-2 hover:bg-emerald-50 hover:border-emerald-500 disabled:opacity-50"
      >
        <Plus className="h-6 w-6" />
      </Button>
    </div>
  );
};

export default ShareCounter;
