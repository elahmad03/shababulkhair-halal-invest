// app/(admin)/cycles/[cycleId]/_components/investors-tab.tsx
"use client"

import { Download } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { InvestorsTable } from "./InvestorsTable"
import { Investor } from "@/lib/types/cycle"

interface InvestorsTabProps {
  investors: Investor[]
}

export function InvestorsTab({ investors }: InvestorsTabProps) {
  const handleExportCSV = () => {
    // TODO: Implement CSV export
    console.log("Exporting to CSV...")
  }

  return (
    <Card className="border-blue-100 bg-blue-50">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-blue-900">Investor List</CardTitle>
            <CardDescription className="text-blue-700">
              {investors.length} shareholders in this cycle
            </CardDescription>
          </div>
          <Button
            onClick={handleExportCSV}
            className="bg-blue-600 hover:bg-blue-700 text-white border-0"
          >
            <Download className="mr-2 h-4 w-4" />
            Export to CSV
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <InvestorsTable data={investors} />
      </CardContent>
    </Card>
  )
}