"use client";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { BusinessVenture, CycleStatus } from "@/lib/types/cycle";
import { formatCurrency } from "@/lib/utils";

interface VenturesTabProps {
  ventures: BusinessVenture[];
  status: CycleStatus;
}

export function VenturesTab({ ventures }: VenturesTabProps) {
  return (
    <Card className="border bg-card text-card-foreground">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-foreground">Business Ventures</CardTitle>
            <CardDescription className="text-muted-foreground">
              Capital allocation and venture performance
            </CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Managed By</TableHead>
                <TableHead>Venture / Company Name</TableHead>
                <TableHead>Allocated Amount</TableHead>
                <TableHead>Profit Realized</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {ventures.length > 0 ? (
                ventures.map((venture) => (
                  <TableRow key={venture.id}>
                    <TableCell className="font-medium">{venture.managedBy}</TableCell>
                    <TableCell>{venture.ventureName}</TableCell>
                    <TableCell>
                      {formatCurrency(venture.allocatedAmount)}
                    </TableCell>
                    <TableCell className="text-primary font-semibold">
                      {venture.profitRealized
                        ? `${formatCurrency(venture.profitRealized)}`
                        : "N/A"}
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={4} className="h-24 text-center text-muted-foreground">
                    No ventures allocated to this cycle yet.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  );
}
