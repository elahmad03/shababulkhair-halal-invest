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
import { investmentCycles, committeeMembers } from "@/lib/data/Businessdata"

const AddAllocationModal = () => {
  const [open, setOpen] = useState(false)
  const [formData, setFormData] = useState({
    investmentCycle: "",
    ventureName: "",
    managedBy: "",
    allocatedAmount: "",
    profitRealized: "",
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    console.log("Form submitted:", formData)
    setOpen(false)
    setFormData({
      investmentCycle: "",
      ventureName: "",
      managedBy: "",
      allocatedAmount: "",
      profitRealized: "",
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
              <Label htmlFor="investmentCycle" className="text-sm font-medium">
                Investment Cycle
              </Label>
              <Select
                value={formData.investmentCycle}
                onValueChange={(value) =>
                  setFormData({ ...formData, investmentCycle: value })
                }
              >
                <SelectTrigger id="investmentCycle" className="w-full">
                  <SelectValue placeholder="Select cycle" />
                </SelectTrigger>
                <SelectContent>
                  {investmentCycles.map((cycle) => (
                    <SelectItem key={cycle.id} value={cycle.name}>
                      {cycle.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="grid gap-2">
              <Label htmlFor="ventureName" className="text-sm font-medium">
                Venture Name
              </Label>
              <Input
                id="ventureName"
                placeholder="e.g., Phone Accessories Import"
                value={formData.ventureName}
                onChange={(e) =>
                  setFormData({ ...formData, ventureName: e.target.value })
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
                  {committeeMembers.map((member) => (
                    <SelectItem key={member.id} value={member.name}>
                      {member.name}
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
              <Label htmlFor="profitRealized" className="text-sm font-medium">
                Profit Realized (₦){" "}
                <span className="text-muted-foreground text-xs font-normal">
                  (Optional)
                </span>
              </Label>
              <Input
                id="profitRealized"
                type="number"
                placeholder="0.00"
                value={formData.profitRealized}
                onChange={(e) =>
                  setFormData({ ...formData, profitRealized: e.target.value })
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