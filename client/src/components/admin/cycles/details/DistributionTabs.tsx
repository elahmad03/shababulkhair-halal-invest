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
  }

  if (cycleData.status === "Active") {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Finalize Cycle & Distribute Profits</CardTitle>
          <CardDescription>
            Enter the total profit realized to close this cycle
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="totalProfit">Total Profit Realized *</Label>
            <Input
              id="totalProfit"
              type="number"
              placeholder="Enter total profit amount"
              value={totalProfit}
              onChange={(e) => setTotalProfit(e.target.value)}
            />
          </div>

          <div className="grid grid-cols-2 gap-4 p-4 bg-muted rounded-lg">
            <div>
              <Label className="text-sm text-muted-foreground">
                Investor Pool (80%)
              </Label>
              <p className="text-2xl font-bold">
                ₦{parseFloat(investorPool).toLocaleString()}
              </p>
            </div>
            <div>
              <Label className="text-sm text-muted-foreground">
                Organizational Share (20%)
              </Label>
              <p className="text-2xl font-bold">
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
            />
            <Label
              htmlFor="confirm"
              className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
            >
              I confirm the profit amount is final and correct. This action is
              irreversible.
            </Label>
          </div>

          <Button
            className="w-full bg-red-600 hover:bg-red-700 text-white"
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
      <Card>
        <CardHeader>
          <CardTitle>Distribution Summary</CardTitle>
          <CardDescription>Final profit distribution record</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label className="text-sm text-muted-foreground">
                Total Profit Realized
              </Label>
              <p className="text-xl font-bold">
                ₦{cycleData.profitRealized?.toLocaleString()}
              </p>
            </div>
            <div>
              <Label className="text-sm text-muted-foreground">
                Investor Pool (80%)
              </Label>
              <p className="text-xl font-bold">
                ₦{cycleData.investorPool?.toLocaleString()}
              </p>
            </div>
            <div>
              <Label className="text-sm text-muted-foreground">
                Organizational Share (20%)
              </Label>
              <p className="text-xl font-bold">
                ₦{cycleData.organizationalShare?.toLocaleString()}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardContent className="py-8 text-center text-muted-foreground">
        Profit distribution controls will become available once the cycle is
        ready to be closed.
      </CardContent>
    </Card>
  )
}