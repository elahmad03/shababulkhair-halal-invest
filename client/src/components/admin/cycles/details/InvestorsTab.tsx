"use client";

import { Download } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { InvestorsTable } from "./InvestorsTable";
import { Investor } from "@/lib/types/cycle";

interface InvestorsTabProps {
  investors: Investor[];
}

/**
 * Neutralizes formula triggers for CSV exports (OWASP CWE-1236 / CSV Injection).
 * If a cell begins with '=', '+', '-', '@', '\t', or '\r', spreadsheet software
 * interprets it as a formula. We prepend a single quote (') to force literal interpretation
 * and escape internal double quotes.
 */
function sanitizeCsvCell(value: unknown): string {
  if (value == null) return '""';
  const str = String(value);
  const formulaTriggers = ["=", "+", "-", "@", "\t", "\r"];
  let safeStr = str;
  if (formulaTriggers.some((prefix) => safeStr.startsWith(prefix))) {
    safeStr = `'${safeStr}`;
  }
  return `"${safeStr.replace(/"/g, '""')}"`;
}

export function InvestorsTab({ investors }: InvestorsTabProps) {
  const handleExportCSV = () => {
    if (investors.length === 0) return;
    const headers = [
      "Member Name",
      "Shares",
      "Amount Invested (NGN)",
      "Share %",
      "Profit Earned (NGN)",
    ].map(sanitizeCsvCell);

    const rows = investors.map((inv) => [
      sanitizeCsvCell(inv.memberName),
      sanitizeCsvCell(inv.shares),
      sanitizeCsvCell((Number(inv.amountInvested) / 100).toFixed(2)),
      sanitizeCsvCell(inv.sharePercentage.toFixed(2)),
      sanitizeCsvCell(inv.profitEarned ? (Number(inv.profitEarned) / 100).toFixed(2) : "0.00"),
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
