// components/admin/distribution-tab.tsx
"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Checkbox } from "@/components/ui/checkbox"
import { CycleDetails } from "@/lib/types/cycle"
import { toast } from "sonner"
import {formatCurrency} from '@/lib/utils'
interface DistributionTabProps {
  cycleData: CycleDetails
}

export function DistributionTab({ cycleData }: DistributionTabProps) {
  const [totalProfit, setTotalProfit] = useState("")
  const [confirmDistribution, setConfirmDistribution] = useState(false)

  const investorPool = totalProfit
    ? (parseFloat(totalProfit) * 0.8).toFixed(2)
    : "0.00"
  const organizationalShare = totalProfit
    ? (parseFloat(totalProfit) * 0.2).toFixed(2)
    : "0.00"

  const handleCloseCycle = async () => {
    // TODO: Implement backend API call
    console.log("Closing cycle with profit:", totalProfit)
    toast.success("Cycle closed and profits distributed successfully.")
  }

  if (cycleData.status === "Active") {
    return (
      <Card className="border-green-100 bg-green-50">
        <CardHeader>
          <CardTitle className="text-green-900">Finalize Cycle & Distribute Profits</CardTitle>
          <CardDescription className="text-green-700">
            Enter the total profit realized to close this cycle
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="totalProfit" className="text-green-900">Total Profit Realized *</Label>
            <Input
              id="totalProfit"
              type="number"
              placeholder="Enter total profit amount"
              value={totalProfit}
              onChange={(e) => setTotalProfit(e.target.value)}
              className="border-green-200 focus:border-green-400 focus:ring-green-400"
            />
          </div>

          <div className="grid grid-cols-2 gap-4 p-4 bg-green-100 rounded-lg border border-green-200">
            <div>
              <Label className="text-sm text-green-700">
                Investor Pool (80%)
              </Label>
              <p className="text-2xl font-bold text-green-900">
                ₦{parseFloat(investorPool).toLocaleString()}
              </p>
            </div>
            <div>
              <Label className="text-sm text-green-700">
                Organizational Share (20%)
              </Label>
              <p className="text-2xl font-bold text-green-900">
                ₦{parseFloat(organizationalShare).toLocaleString()}
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <Checkbox
              id="confirm"
              checked={confirmDistribution}
              onCheckedChange={(checked) =>
                setConfirmDistribution(checked as boolean)
              }
              className="border-green-600 text-green-600"
            />
            <Label
              htmlFor="confirm"
              className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 text-green-900"
            >
              I confirm the profit amount is final and correct. This action is
              irreversible.
            </Label>
          </div>

          <Button
            className="w-full bg-green-600 hover:bg-green-700 text-white border-0"
            size="lg"
            disabled={!totalProfit || !confirmDistribution}
            onClick={handleCloseCycle}
          >
            Close Cycle & Distribute Profits
          </Button>
        </CardContent>
      </Card>
    )
  }

  if (cycleData.status === "Completed") {
    return (
      <Card className="border-green-100 bg-green-50">
        <CardHeader>
          <CardTitle className="text-green-900">Distribution Summary</CardTitle>
          <CardDescription className="text-green-700">Final profit distribution record</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label className="text-sm text-green-700">
                Total Profit Realized
              </Label>
              <p className="text-xl font-bold text-green-900">
                {formatCurrency(cycleData.profitRealized)}
              </p>
            </div>
            <div>
              <Label className="text-sm text-green-700">
                Investor Pool (80%)
              </Label>
              <p className="text-xl font-bold text-green-900">
                {formatCurrency(cycleData.investorPool)}
              </p>
            </div>
            <div>
              <Label className="text-sm text-green-700">
                Organizational Share (20%)
              </Label>
              <p className="text-xl font-bold text-green-900">
                ₦{formatCurrency(cycleData.organizationalShare)}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="border-slate-200">
      <CardContent className="py-8 text-center text-slate-600">
        Profit distribution controls will become available once the cycle is
        ready to be closed.
      </CardContent>
    </Card>
  )
}