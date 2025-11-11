// components/admin/ventures-tab.tsx
"use client"

import { Plus } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { BusinessVenture, CycleStatus } from "@/lib/types/cycle"
import { formatCurrency } from "@/lib/utils"

interface VenturesTabProps {
  ventures: BusinessVenture[]
  status: CycleStatus
}

export function VenturesTab({ ventures, status }: VenturesTabProps) {
  const handleAddAllocation = () => {
    // TODO: Implement add allocation
    console.log("Adding allocation...")
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>Business Ventures</CardTitle>
            <CardDescription>
              Capital allocation and venture performance
            </CardDescription>
          </div>
          {status === "Active" && (
            <Button
              onClick={handleAddAllocation}
              className="bg-gradient-to-r from-emerald-600 to-green-500 text-white hover:opacity-90"
            >
              <Plus className="mr-2 h-4 w-4" />
              Add Allocation
            </Button>
          )}
        </div>
      </CardHeader>
      <CardContent>
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Managed By</TableHead>
                <TableHead>Venture/Company Name</TableHead>
                <TableHead>Allocated Amount</TableHead>
                <TableHead>Profit Realized</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {ventures.length > 0 ? (
                ventures.map((venture) => (
                  <TableRow key={venture.id}>
                    <TableCell>{venture.managedBy}</TableCell>
                    <TableCell>{venture.ventureName}</TableCell>
                    <TableCell>
                      {formatCurrency(venture.allocatedAmount)}
                    </TableCell>
                    <TableCell>
                      {venture.profitRealized
                        ? `${formatCurrency(venture.profitRealized)}`
                        : "N/A"}
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={4} className="h-24 text-center">
                    No ventures allocated yet.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  )
}