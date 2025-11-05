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
  DialogTrigger,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Plus } from "lucide-react"
import type { InvestmentCycle, User } from "@/db"

interface AddAllocationModalProps {
  cycles: InvestmentCycle[]
  committeeMembers: User[]
}

const AddAllocationModal = ({ cycles, committeeMembers }: AddAllocationModalProps) => {
  const [open, setOpen] = useState(false)
  const [formData, setFormData] = useState({
    cycleId: "",
    companyName: "",
    managedBy: "",
    allocatedAmount: "",
    expectedProfit: "",
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    
    // Convert amount to Kobo (multiply by 100)
    const allocatedInKobo = BigInt(Math.round(parseFloat(formData.allocatedAmount) * 100))
    const expectedInKobo = formData.expectedProfit 
      ? BigInt(Math.round(parseFloat(formData.expectedProfit) * 100))
      : 0n
    
    const payload = {
      cycleId: parseInt(formData.cycleId),
      companyName: formData.companyName,
      managedBy: parseInt(formData.managedBy),
      allocatedAmount: allocatedInKobo,
      expectedProfit: expectedInKobo,
      profitRealized: 0n,
    }
    
    console.log("Form submitted:", payload)
    setOpen(false)
    
    // Reset form
    setFormData({
      cycleId: "",
      companyName: "",
      managedBy: "",
      allocatedAmount: "",
      expectedProfit: "",
    })
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="bg-gradient-to-r from-emerald-500 to-green-600 hover:from-emerald-600 hover:to-green-700 text-white shadow-md hover:shadow-lg transition-all w-full sm:w-auto">
          <Plus className="mr-2 h-4 w-4" />
          <span className="hidden sm:inline">Add New Allocation</span>
          <span className="sm:hidden">Add Allocation</span>
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[500px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-lg sm:text-xl">Log New Business Allocation</DialogTitle>
          <DialogDescription className="text-sm">
            Record the details of a new business investment venture.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="cycleId" className="text-sm font-medium">
                Investment Cycle
              </Label>
              <Select
                value={formData.cycleId}
                onValueChange={(value) =>
                  setFormData({ ...formData, cycleId: value })
                }
              >
                <SelectTrigger id="cycleId" className="w-full">
                  <SelectValue placeholder="Select cycle" />
                </SelectTrigger>
                <SelectContent>
                  {cycles
                    .filter((cycle) => cycle.status === "active" || cycle.status === "open_for_investment")
                    .map((cycle) => (
                      <SelectItem key={cycle.id} value={cycle.id.toString()}>
                        {cycle.name}
                      </SelectItem>
                    ))}
                </SelectContent>
              </Select>
            </div>

            <div className="grid gap-2">
              <Label htmlFor="companyName" className="text-sm font-medium">
                Venture Name
              </Label>
              <Input
                id="companyName"
                placeholder="e.g., Phone Accessories Import"
                value={formData.companyName}
                onChange={(e) =>
                  setFormData({ ...formData, companyName: e.target.value })
                }
                className="w-full"
                required
              />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="managedBy" className="text-sm font-medium">
                Managed By
              </Label>
              <Select
                value={formData.managedBy}
                onValueChange={(value) =>
                  setFormData({ ...formData, managedBy: value })
                }
              >
                <SelectTrigger id="managedBy" className="w-full">
                  <SelectValue placeholder="Select committee member" />
                </SelectTrigger>
                <SelectContent>
                  {committeeMembers
                    .filter((member) => member.role === "committee")
                    .map((member) => (
                      <SelectItem key={member.id} value={member.id.toString()}>
                        {member.fullName}
                      </SelectItem>
                    ))}
                </SelectContent>
              </Select>
            </div>

            <div className="grid gap-2">
              <Label htmlFor="allocatedAmount" className="text-sm font-medium">
                Allocated Amount (₦)
              </Label>
              <Input
                id="allocatedAmount"
                type="number"
                step="0.01"
                placeholder="0.00"
                value={formData.allocatedAmount}
                onChange={(e) =>
                  setFormData({ ...formData, allocatedAmount: e.target.value })
                }
                className="w-full"
                required
              />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="expectedProfit" className="text-sm font-medium">
                Expected Profit (₦){" "}
                <span className="text-muted-foreground text-xs font-normal">
                  (Optional)
                </span>
              </Label>
              <Input
                id="expectedProfit"
                type="number"
                step="0.01"
                placeholder="0.00"
                value={formData.expectedProfit}
                onChange={(e) =>
                  setFormData({ ...formData, expectedProfit: e.target.value })
                }
                className="w-full"
              />
            </div>
          </div>

          <DialogFooter className="gap-2 sm:gap-0">
            <Button
              type="button"
              variant="outline"
              onClick={() => setOpen(false)}
              className="w-full sm:w-auto"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              className="bg-gradient-to-r from-emerald-500 to-green-600 hover:from-emerald-600 hover:to-green-700 w-full sm:w-auto"
            >
              Save Allocation
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}

export default AddAllocationModal