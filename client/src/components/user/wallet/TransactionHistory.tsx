"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { 
  ArrowDownLeft, 
  ArrowUpRight, 
  Clock, 
  CheckCircle2, 
  XCircle, 
  ReceiptText 
} from "lucide-react";

interface Transaction {
  id: string;
  transactionType: string;
  amountKobo: string;
  transactionStatus: string;
  createdAt: string;
}

export default function TransactionHistory({ transactions }: { transactions: Transaction[] }) {
  // Helpers for UI state
  const getStatusIcon = (status: string) => {
    switch (status) {
      case "COMPLETED": return <CheckCircle2 className="w-3.5 h-3.5 mr-1" />;
      case "PENDING": return <Clock className="w-3.5 h-3.5 mr-1" />;
      case "FAILED": return <XCircle className="w-3.5 h-3.5 mr-1" />;
      default: return null;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "COMPLETED": return "bg-emerald-500/10 text-emerald-600 hover:bg-emerald-500/20 border-emerald-200";
      case "PENDING": return "bg-amber-500/10 text-amber-600 hover:bg-amber-500/20 border-amber-200";
      case "FAILED": return "bg-rose-500/10 text-rose-600 hover:bg-rose-500/20 border-rose-200";
      default: return "bg-gray-100 text-gray-600";
    }
  };

  const isCredit = (type: string) => type === "DEPOSIT" || type === "PROFIT_DISTRIBUTION";

  return (
    <Card className="shadow-sm border-border/50 h-full">
      <CardHeader className="flex flex-row items-center justify-between pb-4 border-b">
        <div className="space-y-1">
          <CardTitle className="text-xl font-semibold">Recent Transactions</CardTitle>
          <p className="text-sm text-muted-foreground">Your latest financial activity.</p>
        </div>
        <Button variant="ghost" size="sm" className="hidden sm:flex">
          View All
        </Button>
      </CardHeader>
      
      <CardContent className="p-0">
        {transactions.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center mb-4">
              <ReceiptText className="h-6 w-6 text-primary" />
            </div>
            <h3 className="text-lg font-medium">No transactions yet</h3>
            <p className="text-sm text-muted-foreground mt-1 max-w-sm">
              When you deposit funds or request a withdrawal, they will appear here.
            </p>
          </div>
        ) : (
          <div className="divide-y divide-border/50">
            {transactions.map((tx) => (
              <div 
                key={tx.id} 
                className="flex items-center justify-between p-4 md:p-6 hover:bg-muted/30 transition-colors group"
              >
                <div className="flex items-center gap-4">
                  {/* Transaction Icon */}
                  <div className={`h-10 w-10 rounded-full flex items-center justify-center shrink-0 ${
                    isCredit(tx.transactionType) ? "bg-emerald-100 text-emerald-600" : "bg-rose-100 text-rose-600"
                  }`}>
                    {isCredit(tx.transactionType) ? <ArrowDownLeft className="h-5 w-5" /> : <ArrowUpRight className="h-5 w-5" />}
                  </div>
                  
                  {/* Transaction Details */}
                  <div className="space-y-1">
                    <p className="font-medium text-sm leading-none">
                      {tx.transactionType.replace(/_/g, " ")}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {new Intl.DateTimeFormat('en-NG', { 
                        dateStyle: 'medium', 
                        timeStyle: 'short' 
                      }).format(new Date(tx.createdAt))}
                    </p>
                  </div>
                </div>

                {/* Amount and Status */}
                <div className="flex flex-col items-end gap-1.5">
                  <span className={`font-semibold ${isCredit(tx.transactionType) ? "text-emerald-600" : ""}`}>
                    {isCredit(tx.transactionType) ? "+" : "-"}
                    ₦{(Number(tx.amountKobo) / 100).toLocaleString("en-NG", { minimumFractionDigits: 2 })}
                  </span>
                  <Badge variant="outline" className={`text-[10px] px-1.5 py-0 border ${getStatusColor(tx.transactionStatus)}`}>
                    {getStatusIcon(tx.transactionStatus)}
                    {tx.transactionStatus}
                  </Badge>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}