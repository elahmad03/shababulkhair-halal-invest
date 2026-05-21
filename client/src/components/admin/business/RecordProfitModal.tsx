"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Loader2, TrendingUp } from "lucide-react"
import { formatCurrency } from "@/lib/utils"
import { toast } from "sonner"
import { useRecordVentureProfitMutation } from "@/store/modules/venture/ventureApi"
import type { Venture } from "@/store/modules/venture/venture.types"

interface RecordProfitModalProps {
  venture: Venture | null
  open: boolean
  onOpenChange: (open: boolean) => void
  onSuccess?: () => void
}

const RecordProfitModal = ({
  venture,
  open,
  onOpenChange,
  onSuccess,
}: RecordProfitModalProps) => {
  const [profitAmount, setProfitAmount] = useState("")
  const [error, setError] = useState<string | null>(null)
  const [recordProfit, { isLoading }] = useRecordVentureProfitMutation()

  if (!venture) return null

  const currentProfit = Number(venture.profitRealizedKobo) / 100
  const expectedProfit = Number(venture.expectedProfitKobo) / 100

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)

    // Validation
    if (!profitAmount || profitAmount === "") {
      setError("Profit amount is required")
      return
    }

    const profitNaira = parseFloat(profitAmount)
    if (isNaN(profitNaira) || profitNaira < 0) {
      setError("Profit amount must be a valid non-negative number")
      return
    }

    if (profitNaira > 1_000_000_000) {
      setError("Profit amount too large")
      return
    }

    try {
      await recordProfit({
        id: venture.id,
        body: { profitRealizedNaira: profitNaira },
      }).unwrap()

      toast.success(
        `Profit recorded: ${formatCurrency(profitNaira * 100)}`,
        { description: `${venture.companyName} profit updated` }
      )

      setProfitAmount("")
      setError(null)
      onOpenChange(false)
      onSuccess?.()
    } catch (err: any) {
      const message = err?.data?.message || "Failed to record profit"
      setError(message)
      toast.error(message)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5 text-primary" />
            Record Profit
          </DialogTitle>
          <DialogDescription>
            Update realized profit for <span className="font-semibold">{venture.companyName}</span>
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Current Profit Info */}
          <div className="grid grid-cols-2 gap-4 p-3 bg-muted/50 rounded-lg">
            <div>
              <p className="text-xs text-muted-foreground mb-1">Current Profit</p>
              <p className="font-semibold text-primary">{formatCurrency(currentProfit * 100)}</p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground mb-1">Expected Profit</p>
              <p className="font-semibold">{formatCurrency(expectedProfit * 100)}</p>
            </div>
          </div>

          {/* Profit Amount Input */}
          <div className="grid gap-2">
            <Label htmlFor="profitAmount" className="text-sm font-medium">
              Realized Profit (₦ Naira)
            </Label>
            <Input
              id="profitAmount"
              type="number"
              step="0.01"
              placeholder="0.00"
              value={profitAmount}
              onChange={(e) => {
                setProfitAmount(e.target.value)
                setError(null)
              }}
              disabled={isLoading}
              className="text-base"
            />
            {error && (
              <p className="text-xs text-destructive mt-1">{error}</p>
            )}
          </div>

          {/* Note about installments */}
          <p className="text-xs text-muted-foreground italic">
            💡 Tip: You can record profit multiple times as installments arrive. The total will accumulate.
          </p>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={isLoading}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              className="bg-primary hover:bg-primary/90 text-primary-foreground"
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Recording...
                </>
              ) : (
                <>
                  <TrendingUp className="mr-2 h-4 w-4" />
                  Record Profit
                </>
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}

export default RecordProfitModal
