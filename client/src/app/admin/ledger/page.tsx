"use client"

import { useMemo, useState } from "react"
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { DataTable } from "@/components/ui/data-table"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Input } from "@/components/ui/input"
import { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem } from "@/components/ui/dropdown-menu"
import { mockData } from "@/db/mockData"
import { formatCurrency } from "@/lib/utils"

export default function AdminOrganizationalLedger() {
  const [isAddOpen, setIsAddOpen] = useState(false)
  const [entryType, setEntryType] = useState<"income" | "expense">("income")
  const [relatedCycleId, setRelatedCycleId] = useState<number | null>(null)
  const [source, setSource] = useState("")
  const [date, setDate] = useState<string | null>(null)
  const [amount, setAmount] = useState<string>("")

  const users = mockData.users
  const cycles = mockData.investmentCycles
  const ledger = mockData.organizationalLedger

  const totalIncome = useMemo(() => {
    return ledger.filter((l) => l.entryType === "income").reduce((s, r) => s + Number(r.amount), 0)
  }, [ledger])

  const totalExpenses = useMemo(() => {
    return ledger.filter((l) => l.entryType === "expense").reduce((s, r) => s + Number(r.amount), 0)
  }, [ledger])

  const net = totalIncome - totalExpenses

  const columns = useMemo(() => {
    return [
      { header: "Date", accessorKey: "date", cell: (c: any) => new Date(c.getValue()).toLocaleDateString() },
      { header: "Source / Description", accessorKey: "source" },
      {
        header: "Entry Type",
        accessorKey: "entryType",
        cell: (c: any) => (
          <Badge variant={c.getValue() === "income" ? "default" : "outline"}>
            {String(c.getValue()).toUpperCase()}
          </Badge>
        ),
      },
      {
        header: "Related Cycle",
        accessorKey: "relatedCycleId",
        cell: (c: any) => {
          const id = c.getValue() as number | null
          const cycle = cycles.find((x) => x.id === id)
          return cycle?.name ?? ""
        },
      },
      {
        header: "Amount",
        accessorKey: "amount",
        cell: (c: any) => {
          const row = c.row?.original
          const amt = Number(c.getValue())
          const color = row?.entryType === "income" ? "text-green-600" : "text-destructive"
          return <div className={`${color} font-medium`}>{formatCurrency(amt)}</div>
        },
      },
      {
        header: "Recorded By",
        accessorKey: "recordedBy",
        cell: (c: any) => users.find((u) => u.id === c.getValue())?.fullName ?? "-",
      },
      {
        header: "Actions",
        accessorKey: "id",
        cell: (c: any) => (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button size="sm" variant="outline">Actions</Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem>Edit</DropdownMenuItem>
              <DropdownMenuItem>Delete</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        ),
      },
    ]
  }, [users, cycles])

  return (
    <div className="px-4 py-6">
      <div className="flex items-start justify-between gap-4">
        <h1 className="text-2xl font-semibold">Organizational Ledger</h1>
        <div className="hidden sm:block">
          <Button onClick={() => setIsAddOpen(true)}>+ Add Entry</Button>
        </div>
      </div>

      <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle className="text-sm">Total Income</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-xl font-semibold">{formatCurrency(totalIncome)}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-sm">Total Expenses</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-xl font-semibold">{formatCurrency(totalExpenses)}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-sm">Net Balance</CardTitle>
          </CardHeader>
          <CardContent>
            <div className={`text-xl font-semibold ${net >= 0 ? "text-green-600" : "text-destructive"}`}>
              {formatCurrency(net)}
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="mt-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Ledger Entries</CardTitle>
            <div className="sm:hidden mt-2">
              <Button onClick={() => setIsAddOpen(true)}>+ Add Entry</Button>
            </div>
          </CardHeader>
          <CardContent className="p-0">
            <div className="p-4">
              <DataTable columns={columns as any} data={ledger as any} />
            </div>
          </CardContent>
        </Card>
      </div>

      <Dialog open={isAddOpen} onOpenChange={setIsAddOpen}>
        <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Add Ledger Entry</DialogTitle>
          </DialogHeader>

          <div className="space-y-4 mt-2">
            <div>
              <div className="text-sm text-muted-foreground mb-2">Entry Type</div>
              <RadioGroup value={entryType} onValueChange={(v: any) => setEntryType(v)} className="flex gap-3">
                <label className="flex items-center gap-2">
                  <RadioGroupItem value="income" />
                  <span>Income</span>
                </label>
                <label className="flex items-center gap-2">
                  <RadioGroupItem value="expense" />
                  <span>Expense</span>
                </label>
              </RadioGroup>
            </div>

            {entryType === "income" && (
              <div>
                <div className="text-sm text-muted-foreground mb-2">Related Investment Cycle</div>
                <Select onValueChange={(v) => setRelatedCycleId(Number(v))}>
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Select cycle" />
                  </SelectTrigger>
                  <SelectContent>
                    {cycles.map((c) => (
                      <SelectItem key={c.id} value={String(c.id)}>
                        {c.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}

            <div>
              <div className="text-sm text-muted-foreground mb-2">Source / Description</div>
              <Input value={source} onChange={(e) => setSource(e.target.value)} placeholder="Office Supplies / Profit Share from Aug Cycle" />
            </div>

            <div>
              <div className="text-sm text-muted-foreground mb-2">Date</div>
              <Input type="date" value={date ?? ""} onChange={(e) => setDate(e.target.value)} />
            </div>

            <div>
              <div className="text-sm text-muted-foreground mb-2">Amount</div>
              <Input value={amount} onChange={(e) => setAmount(e.target.value)} placeholder="Amount in kobo or NGN" />
            </div>
          </div>

          <DialogFooter>
            <div className="flex gap-2 sm:justify-end w-full">
              <Button variant="outline" onClick={() => setIsAddOpen(false)}>Cancel</Button>
              <Button onClick={() => {
                // Placeholder: would call API to save. For now just close.
                setIsAddOpen(false)
              }}>Save Entry</Button>
            </div>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
