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
import { Textarea } from "@/components/ui/textarea"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Plus, Send } from "lucide-react"
import type { InvestmentCycle, User } from "@/db"

interface CreateNotificationDialogProps {
  cycles: InvestmentCycle[]
  users: User[]
}

type RecipientType = "all_users" | "specific_user" | "cycle_investors" | "committee_members"

const CreateNotificationDialog = ({ cycles, users }: CreateNotificationDialogProps) => {
  const [open, setOpen] = useState(false)
  const [formData, setFormData] = useState({
    recipientType: "" as RecipientType | "",
    specificUserId: "",
    cycleId: "",
    title: "",
    message: "",
    link: "",
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    // Determine recipients based on type
    let recipients: number[] = []
    let recipientLabel = ""

    switch (formData.recipientType) {
      case "all_users":
        recipients = users.map((u) => u.id)
        recipientLabel = "All Users"
        break
      case "specific_user":
        recipients = [parseInt(formData.specificUserId)]
        const user = users.find((u) => u.id === parseInt(formData.specificUserId))
        recipientLabel = user?.fullName || "Specific User"
        break
      case "cycle_investors":
        // In a real app, you'd query shareholderInvestments for this cycle
        recipientLabel = `Investors in: ${cycles.find((c) => c.id === parseInt(formData.cycleId))?.name || "Cycle"}`
        break
      case "committee_members":
        recipients = users.filter((u) => u.role === "committee").map((u) => u.id)
        recipientLabel = "Committee Members"
        break
    }

    const payload = {
      recipients,
      recipientLabel,
      title: formData.title,
      message: formData.message,
      link: formData.link || null,
      sentBy: 1, // Current admin ID - in real app, get from auth
      sentAt: new Date(),
    }

    console.log("Notification payload:", payload)
    setOpen(false)

    // Reset form
    setFormData({
      recipientType: "",
      specificUserId: "",
      cycleId: "",
      title: "",
      message: "",
      link: "",
    })
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="bg-gradient-to-r from-emerald-500 to-green-600 hover:from-emerald-600 hover:to-green-700 text-white shadow-md hover:shadow-lg transition-all w-full sm:w-auto">
          <Plus className="mr-2 h-4 w-4" />
          <span className="hidden sm:inline">Create Notification</span>
          <span className="sm:hidden">New</span>
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-lg sm:text-xl">Compose New Notification</DialogTitle>
          <DialogDescription className="text-sm">
            Send targeted notifications to users about important updates.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="grid gap-4 py-4">
            {/* Recipient Type Selection */}
            <div className="grid gap-2">
              <Label htmlFor="recipientType" className="text-sm font-medium">
                Send To
              </Label>
              <Select
                value={formData.recipientType}
                onValueChange={(value: RecipientType) => {
                  setFormData({
                    ...formData,
                    recipientType: value,
                    specificUserId: "",
                    cycleId: "",
                  })
                }}
              >
                <SelectTrigger id="recipientType" className="w-full">
                  <SelectValue placeholder="Select recipient group" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all_users">All Users</SelectItem>
                  <SelectItem value="specific_user">Specific User...</SelectItem>
                  <SelectItem value="cycle_investors">Investors in Cycle...</SelectItem>
                  <SelectItem value="committee_members">Committee Members</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Conditional: Specific User Selection */}
            {formData.recipientType === "specific_user" && (
              <div className="grid gap-2">
                <Label htmlFor="specificUserId" className="text-sm font-medium">
                  Select User
                </Label>
                <Select
                  value={formData.specificUserId}
                  onValueChange={(value) =>
                    setFormData({ ...formData, specificUserId: value })
                  }
                >
                  <SelectTrigger id="specificUserId" className="w-full">
                    <SelectValue placeholder="Search and select user" />
                  </SelectTrigger>
                  <SelectContent>
                    {users.map((user) => (
                      <SelectItem key={user.id} value={user.id.toString()}>
                        {user.fullName} ({user.email})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}

            {/* Conditional: Cycle Selection */}
            {formData.recipientType === "cycle_investors" && (
              <div className="grid gap-2">
                <Label htmlFor="cycleId" className="text-sm font-medium">
                  Select Investment Cycle
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
                    {cycles.map((cycle) => (
                      <SelectItem key={cycle.id} value={cycle.id.toString()}>
                        {cycle.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}

            {/* Title */}
            <div className="grid gap-2">
              <Label htmlFor="title" className="text-sm font-medium">
                Notification Title
              </Label>
              <Input
                id="title"
                placeholder="e.g., October 2025 Cycle Now Open"
                value={formData.title}
                onChange={(e) =>
                  setFormData({ ...formData, title: e.target.value })
                }
                className="w-full"
                required
              />
            </div>

            {/* Message */}
            <div className="grid gap-2">
              <Label htmlFor="message" className="text-sm font-medium">
                Message
              </Label>
              <Textarea
                id="message"
                placeholder="Enter the notification message..."
                value={formData.message}
                onChange={(e) =>
                  setFormData({ ...formData, message: e.target.value })
                }
                className="w-full min-h-[120px]"
                required
              />
              <p className="text-xs text-muted-foreground">
                Keep messages clear and concise for better engagement.
              </p>
            </div>

            {/* Optional Link */}
            <div className="grid gap-2">
              <Label htmlFor="link" className="text-sm font-medium">
                Link (Optional)
              </Label>
              <Input
                id="link"
                type="text"
                placeholder="/cycles/6"
                value={formData.link}
                onChange={(e) =>
                  setFormData({ ...formData, link: e.target.value })
                }
                className="w-full"
              />
              <p className="text-xs text-muted-foreground">
                Provide a deep link to direct users to a relevant page.
              </p>
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
              disabled={!formData.recipientType || !formData.title || !formData.message}
              className="bg-gradient-to-r from-emerald-500 to-green-600 hover:from-emerald-600 hover:to-green-700 w-full sm:w-auto"
            >
              <Send className="mr-2 h-4 w-4" />
              Send Notification
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}

export default CreateNotificationDialog