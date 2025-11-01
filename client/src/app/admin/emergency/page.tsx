"use client"

import { useMemo, useState } from "react"
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { DataTable } from "@/components/ui/data-table"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog"
import { mockData } from "@/db/mockData"
import type { EmergencyWithdrawalRequest } from "@/db/types"
import { formatCurrency } from "@/lib/utils"

export default function AdminEmergencyRequestsPage() {
  const [activeTab, setActiveTab] = useState<string>("pending")
  const [selectedRequest, setSelectedRequest] = useState<
    EmergencyWithdrawalRequest | null
  >(null)
  const [isDialogOpen, setIsDialogOpen] = useState(false)

  const users = mockData.users
  const requests = mockData.emergencyWithdrawalRequests

  const filtered = useMemo(() => {
    return requests.filter((r) => r.status === activeTab || (activeTab === "pending" && r.status === "pending"))
  }, [requests, activeTab])

  const columns = useMemo(() => {
    return [
      {
        header: "User",
        accessorKey: "userId",
        cell: (info: any) => {
          const id = info.getValue() as number
          const u = users.find((x) => x.id === id)
          return (
            <div className="flex flex-col">
              <span className="font-medium">{u?.fullName ?? "-"}</span>
              <span className="text-xs text-muted-foreground">{u?.email ?? "-"}</span>
            </div>
          )
        },
      },
      {
        header: "Amount Requested",
        accessorKey: "amount",
        cell: (info: any) => <span>{formatCurrency(info.getValue() as bigint)}</span>,
      },
      {
        header: "Reason",
        accessorKey: "reason",
        cell: (info: any) => {
          const text = info.getValue() as string
          return <span className="max-w-[220px] block truncate">{text}</span>
        },
      },
      {
        header: "Date Requested",
        accessorKey: "requestedAt",
        cell: (info: any) => new Date(info.getValue() as string || info.getValue()).toLocaleDateString(),
      },
      {
        header: "Status",
        accessorKey: "status",
        cell: (info: any) => {
          const s = info.getValue() as string
          const variant = s === "approved" ? "default" : s === "rejected" ? "destructive" : "secondary"
          return <Badge variant={variant}>{s?.toUpperCase()}</Badge>
        },
      },
      {
        header: "Actions",
        accessorKey: "id",
        cell: (info: any) => {
          const id = info.getValue() as number
          const row = requests.find((r) => r.id === id)
          return (
            <div>
              {row?.status === "pending" ? (
                <Button
                  size="sm"
                  onClick={() => {
                    setSelectedRequest(row ?? null)
                    setIsDialogOpen(true)
                  }}
                >
                  Review
                </Button>
              ) : (
                <Button size="sm" variant="outline" disabled>
                  Review
                </Button>
              )}
            </div>
          )
        },
      },
    ]
  }, [requests, users])

  return (
    <div className="px-4 py-6">
      <h1 className="text-2xl font-semibold mb-4">Emergency Requests</h1>

      <Tabs defaultValue="pending" onValueChange={(v) => setActiveTab(v)} className="w-full">
        <TabsList className="grid grid-cols-3 mb-6">
          <TabsTrigger value="pending">Pending</TabsTrigger>
          <TabsTrigger value="approved">Approved</TabsTrigger>
          <TabsTrigger value="rejected">Rejected</TabsTrigger>
        </TabsList>

        <TabsContent value={activeTab}>
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">{activeTab[0].toUpperCase() + activeTab.slice(1)} Requests</CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <div className="p-4">
                <DataTable columns={columns as any} data={filtered as any} />
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-[700px] max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Review Emergency Request</DialogTitle>
            <DialogDescription className="text-sm">
              Carefully review the request below before taking action.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 mt-2">
            {selectedRequest ? (
              (() => {
                const u = users.find((x) => x.id === selectedRequest.userId)
                const totalLocked = "N/A"
                return (
                  <div className="space-y-3">
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                      <div>
                        <div className="text-sm text-muted-foreground">User</div>
                        <div className="font-medium">{u?.fullName}</div>
                        <div className="text-xs text-muted-foreground">{u?.email}</div>
                      </div>
                      <div>
                        <div className="text-sm text-muted-foreground">Requested Amount</div>
                        <div className="font-medium">{formatCurrency(selectedRequest.amount)}</div>
                      </div>
                      <div>
                        <div className="text-sm text-muted-foreground">Date Requested</div>
                        <div className="font-medium">{new Date(selectedRequest.requestedAt).toLocaleString()}</div>
                      </div>
                    </div>

                    <div>
                      <div className="text-sm text-muted-foreground">Full Reason</div>
                      <div className="rounded-md border p-3 bg-background/50 text-sm">{selectedRequest.reason}</div>
                    </div>

                    <div>
                      <div className="text-sm text-muted-foreground">User's Total Locked Capital</div>
                      <div className="font-medium">{totalLocked}</div>
                    </div>
                  </div>
                )
              })()
            ) : (
              <div className="text-sm text-muted-foreground">No request selected</div>
            )}
          </div>

          <DialogFooter>
            <div className="flex items-center gap-2 w-full sm:justify-end">
              <Button
                variant="outline"
                onClick={() => {
                  // open reject path — for now just close and mark none
                  setIsDialogOpen(false)
                  setSelectedRequest(null)
                }}
              >
                Reject
              </Button>
              <Button
                className="bg-green-600"
                onClick={() => {
                  // approve action placeholder
                  setIsDialogOpen(false)
                  setSelectedRequest(null)
                }}
              >
                Approve
              </Button>
            </div>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
