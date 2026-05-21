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
import { Plus, Loader2, AlertCircle } from "lucide-react"
import { toast } from "sonner"
import { useCreateVentureMutation } from "@/store/modules/venture/ventureApi"
import { useListCyclesQuery } from "@/store/modules/cycle/cycleApi"

interface CommitteeMember {
  id: string
  firstName: string
  lastName: string
  email: string
}

interface AddAllocationModalProps {
  committeeMembers: CommitteeMember[]
  onSuccess?: () => void
}

const AddAllocationModal = ({
  committeeMembers,
  onSuccess,
}: AddAllocationModalProps) => {
  const [open, setOpen] = useState(false)
  const [formData, setFormData] = useState({
    cycleId: "",
    companyName: "",
    managedById: "",
    allocatedAmount: "",
    expectedProfit: "",
  })
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({})
  
  const { data: cyclesData, isLoading: cyclesLoading } = useListCyclesQuery({})
  const [createVenture, { isLoading }] = useCreateVentureMutation()

  // Filter ACTIVE cycles only
  const activeCycles = (cyclesData?.data?.cycles || []).filter(
    (c) => c.status === "ACTIVE"
  )

  const validateForm = (): boolean => {
    const errors: Record<string, string> = {}

    if (!formData.cycleId) errors.cycleId = "Cycle is required"
    if (!formData.companyName.trim()) {
      errors.companyName = "Company name is required"
    } else if (formData.companyName.length < 2) {
      errors.companyName = "Company name must be at least 2 characters"
    } else if (formData.companyName.length > 200) {
      errors.companyName = "Company name is too long"
    }

    if (!formData.managedById) errors.managedById = "Manager is required"

    if (!formData.allocatedAmount) {
      errors.allocatedAmount = "Allocated amount is required"
    } else {
      const amount = parseFloat(formData.allocatedAmount)
      if (isNaN(amount) || amount <= 0) {
        errors.allocatedAmount = "Amount must be a positive number"
      } else if (amount > 1_000_000_000) {
        errors.allocatedAmount = "Amount is too large"
      }
    }

    if (formData.expectedProfit) {
      const profit = parseFloat(formData.expectedProfit)
      if (isNaN(profit) || profit < 0) {
        errors.expectedProfit = "Profit must be a non-negative number"
      } else if (profit > 1_000_000_000) {
        errors.expectedProfit = "Amount is too large"
      }
    }

    setFieldErrors(errors)
    return Object.keys(errors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!validateForm()) {
      toast.error("Please fix the errors in the form")
      return
    }

    try {
      await createVenture({
        cycleId: formData.cycleId,
        companyName: formData.companyName.trim(),
        allocatedAmountNaira: parseFloat(formData.allocatedAmount),
        expectedProfitNaira: formData.expectedProfit
          ? parseFloat(formData.expectedProfit)
          : 0,
        managedById: formData.managedById,
      }).unwrap()

      toast.success("Venture created successfully", {
        description: `${formData.companyName} has been allocated`,
      })

      setOpen(false)
      resetForm()
      onSuccess?.()
    } catch (error: any) {
      const message = error?.data?.message || "Failed to create venture"
      toast.error(message)
      setFieldErrors({ submit: message })
    }
  }

  const resetForm = () => {
    setFormData({
      cycleId: "",
      companyName: "",
      managedById: "",
      allocatedAmount: "",
      expectedProfit: "",
    })
    setFieldErrors({})
  }

  const handleOpenChange = (newOpen: boolean) => {
    setOpen(newOpen)
    if (!newOpen) resetForm()
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        <Button className="bg-primary hover:bg-primary/90 text-primary-foreground shadow-md hover:shadow-lg transition-all w-full sm:w-auto">
          <Plus className="mr-2 h-4 w-4" />
          <span className="hidden sm:inline">Add New Venture</span>
          <span className="sm:hidden">Add Venture</span>
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[500px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-lg sm:text-xl">Create Business Venture</DialogTitle>
          <DialogDescription className="text-sm">
            Allocate capital to a new business venture within an active cycle.
          </DialogDescription>
        </DialogHeader>

        {fieldErrors.submit && (
          <div className="flex gap-2 p-3 bg-destructive/10 rounded-lg text-destructive text-sm">
            <AlertCircle className="h-4 w-4 flex-shrink-0 mt-0.5" />
            <p>{fieldErrors.submit}</p>
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="grid gap-4 py-4">
            {/* Cycle Selection */}
            <div className="grid gap-2">
              <Label htmlFor="cycleId" className="text-sm font-medium">
                Investment Cycle <span className="text-destructive">*</span>
              </Label>
              <Select
                value={formData.cycleId}
                onValueChange={(value) => {
                  setFormData({ ...formData, cycleId: value })
                  setFieldErrors({ ...fieldErrors, cycleId: "" })
                }}
                disabled={cyclesLoading || isLoading}
              >
                <SelectTrigger
                  id="cycleId"
                  className={fieldErrors.cycleId ? "border-destructive" : ""}
                >
                  <SelectValue placeholder="Select active cycle" />
                </SelectTrigger>
                <SelectContent>
                  {activeCycles.length === 0 ? (
                    <div className="p-2 text-sm text-muted-foreground">
                      No active cycles available
                    </div>
                  ) : (
                    activeCycles.map((cycle) => (
                      <SelectItem key={cycle.id} value={cycle.id}>
                        {cycle.name}
                      </SelectItem>
                    ))
                  )}
                </SelectContent>
              </Select>
              {fieldErrors.cycleId && (
                <p className="text-xs text-destructive">{fieldErrors.cycleId}</p>
              )}
            </div>

            {/* Company Name */}
            <div className="grid gap-2">
              <Label htmlFor="companyName" className="text-sm font-medium">
                Company Name <span className="text-destructive">*</span>
              </Label>
              <Input
                id="companyName"
                placeholder="e.g., Phone Accessories Import"
                value={formData.companyName}
                onChange={(e) => {
                  setFormData({ ...formData, companyName: e.target.value })
                  setFieldErrors({ ...fieldErrors, companyName: "" })
                }}
                disabled={isLoading}
                className={fieldErrors.companyName ? "border-destructive" : ""}
              />
              {fieldErrors.companyName && (
                <p className="text-xs text-destructive">{fieldErrors.companyName}</p>
              )}
            </div>

            {/* Manager Selection */}
            <div className="grid gap-2">
              <Label htmlFor="managedById" className="text-sm font-medium">
                Venture Manager <span className="text-destructive">*</span>
              </Label>
              <Select
                value={formData.managedById}
                onValueChange={(value) => {
                  setFormData({ ...formData, managedById: value })
                  setFieldErrors({ ...fieldErrors, managedById: "" })
                }}
                disabled={isLoading}
              >
                <SelectTrigger
                  id="managedById"
                  className={fieldErrors.managedById ? "border-destructive" : ""}
                >
                  <SelectValue placeholder="Select committee member" />
                </SelectTrigger>
                <SelectContent>
                  {committeeMembers.map((member) => (
                    <SelectItem key={member.id} value={member.id}>
                      {member.firstName} {member.lastName}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {fieldErrors.managedById && (
                <p className="text-xs text-destructive">{fieldErrors.managedById}</p>
              )}
            </div>

            {/* Allocated Amount */}
            <div className="grid gap-2">
              <Label htmlFor="allocatedAmount" className="text-sm font-medium">
                Allocated Amount (₦) <span className="text-destructive">*</span>
              </Label>
              <Input
                id="allocatedAmount"
                type="number"
                step="0.01"
                placeholder="0.00"
                value={formData.allocatedAmount}
                onChange={(e) => {
                  setFormData({ ...formData, allocatedAmount: e.target.value })
                  setFieldErrors({ ...fieldErrors, allocatedAmount: "" })
                }}
                disabled={isLoading}
                className={fieldErrors.allocatedAmount ? "border-destructive" : ""}
              />
              {fieldErrors.allocatedAmount && (
                <p className="text-xs text-destructive">{fieldErrors.allocatedAmount}</p>
              )}
            </div>

            {/* Expected Profit */}
            <div className="grid gap-2">
              <Label htmlFor="expectedProfit" className="text-sm font-medium">
                Expected Profit (₦){" "}
                <span className="text-muted-foreground text-xs font-normal">Optional</span>
              </Label>
              <Input
                id="expectedProfit"
                type="number"
                step="0.01"
                placeholder="0.00"
                value={formData.expectedProfit}
                onChange={(e) => {
                  setFormData({ ...formData, expectedProfit: e.target.value })
                  setFieldErrors({ ...fieldErrors, expectedProfit: "" })
                }}
                disabled={isLoading}
                className={fieldErrors.expectedProfit ? "border-destructive" : ""}
              />
              {fieldErrors.expectedProfit && (
                <p className="text-xs text-destructive">{fieldErrors.expectedProfit}</p>
              )}
            </div>
          </div>

          <DialogFooter className="gap-2 sm:gap-0">
            <Button
              type="button"
              variant="outline"
              onClick={() => handleOpenChange(false)}
              disabled={isLoading}
              className="w-full sm:w-auto"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={isLoading}
              className="bg-primary hover:bg-primary/90 text-primary-foreground w-full sm:w-auto"
            >
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Creating...
                </>
              ) : (
                <>
                  <Plus className="mr-2 h-4 w-4" />
                  Create Venture
                </>
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}

export default AddAllocationModal