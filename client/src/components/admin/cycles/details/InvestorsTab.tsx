"use client";

import { Download } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { InvestorsTable } from "./InvestorsTable";
import { Investor } from "@/lib/types/cycle";

interface InvestorsTabProps {
  investors: Investor[];
}

export function InvestorsTab({ investors }: InvestorsTabProps) {
  const handleExportCSV = () => {
    if (investors.length === 0) return;
    const headers = ["Member Name", "Shares", "Amount Invested (NGN)", "Share %", "Profit Earned (NGN)"];
    const rows = investors.map((inv) => [
      inv.memberName,
      inv.shares,
      (Number(inv.amountInvested) / 100).toFixed(2),
      inv.sharePercentage.toFixed(2),
      inv.profitEarned ? (Number(inv.profitEarned) / 100).toFixed(2) : "0.00",
    ]);

    const csvContent =
      "data:text/csv;charset=utf-8," +
      [headers.join(","), ...rows.map((e) => e.join(","))].join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `investors-${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <Card className="border bg-card text-card-foreground">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-foreground">Investor List</CardTitle>
            <CardDescription className="text-muted-foreground">
              {investors.length} shareholders in this cycle
            </CardDescription>
          </div>
          {investors.length > 0 && (
            <Button
              onClick={handleExportCSV}
              variant="outline"
              size="sm"
            >
              <Download className="mr-2 h-4 w-4" />
              Export CSV
            </Button>
          )}
        </div>
      </CardHeader>
      <CardContent>
        <InvestorsTable data={investors} />
      </CardContent>
    </Card>
  );
}
