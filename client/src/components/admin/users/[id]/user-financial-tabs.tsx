// components/admin/users/user-financial-tabs.tsx
"use client";

import { useState } from "react";
import { useGetUserInvestmentsQuery, useGetUserTransactionsQuery } from "@/store/modules/user/userApi";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { formatDate, investmentTone, money, titleCase, toneClass } from "../utils";

export function UserFinancialsTabs({ userId, currency }: { userId: string; currency: string }) {
  const [page, setPage] = useState(1);

  const { data: investments, isLoading: investmentsLoading } = useGetUserInvestmentsQuery(userId);
  const { data: txPage, isLoading: transactionsLoading } = useGetUserTransactionsQuery({
    id: userId,
    page,
    limit: 10,
  });

  return (
    <Tabs defaultValue="investments">
      <TabsList className="grid w-full grid-cols-2 sm:w-auto sm:inline-grid">
        <TabsTrigger value="investments">Investments</TabsTrigger>
        <TabsTrigger value="transactions">Transactions</TabsTrigger>
      </TabsList>

      {/* Investments */}
      <TabsContent value="investments" className="flex flex-col gap-3">
        {investmentsLoading ? (
          <>
            <Skeleton className="h-24 w-full rounded-xl" />
            <Skeleton className="h-24 w-full rounded-xl" />
          </>
        ) : investments && investments.length > 0 ? (
          investments.map((inv) => (
            <Card key={inv.id}>
              <CardHeader className="flex-row items-start justify-between space-y-0 pb-2">
                <div className="min-w-0">
                  <CardTitle className="truncate text-base">{inv.venture.name}</CardTitle>
                  <p className="text-sm text-muted-foreground">{inv.cycle.name}</p>
                </div>
                <Badge className={toneClass(investmentTone(inv.status))}>{titleCase(inv.status)}</Badge>
              </CardHeader>
              <CardContent className="grid grid-cols-3 gap-2 border-t pt-3 text-sm">
                <div>
                  <p className="text-xs text-muted-foreground">Invested</p>
                  <p className="font-mono">{money(inv.amount, currency)}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Shares</p>
                  <p className="font-mono">{inv.sharesAcquired}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Date</p>
                  <p className="font-mono">{formatDate(inv.investmentDate)}</p>
                </div>
              </CardContent>
            </Card>
          ))
        ) : (
          <Card>
            <CardContent className="py-10 text-center text-sm text-muted-foreground">
              This member has no investments yet.
            </CardContent>
          </Card>
        )}
      </TabsContent>

      {/* Transactions */}
      <TabsContent value="transactions">
        <Card>
          <CardContent className="divide-y divide-border py-0">
            {transactionsLoading ? (
              <Skeleton className="my-4 h-16 w-full rounded-lg" />
            ) : txPage && txPage.data.length > 0 ? (
              txPage.data.map((tx) => (
                <div key={tx.id} className="flex items-start justify-between gap-3 py-3">
                  <div className="min-w-0">
                    <p className="truncate text-sm font-medium">{tx.description}</p>
                    <p className="text-xs text-muted-foreground">
                      {formatDate(tx.createdAt)}
                      {tx.relatedVenture ? ` · ${tx.relatedVenture.name}` : ""}
                    </p>
                  </div>
                  <div className="flex flex-none flex-col items-end gap-1">
                    <p className="font-mono text-sm tabular-nums">{money(tx.amount, tx.currency)}</p>
                    <Badge className={toneClass(investmentTone(tx.status))}>{titleCase(tx.status)}</Badge>
                  </div>
                </div>
              ))
            ) : (
              <p className="py-10 text-center text-sm text-muted-foreground">
                No transactions for this member yet.
              </p>
            )}
          </CardContent>
        </Card>

        {txPage && txPage.pagination.pages > 1 && (
          <div className="mt-3 flex items-center justify-between text-sm">
            <button
              className="text-muted-foreground disabled:opacity-40"
              disabled={page <= 1}
              onClick={() => setPage((p) => Math.max(1, p - 1))}
            >
              Previous
            </button>
            <span className="text-xs text-muted-foreground">
              Page {txPage.pagination.page} of {txPage.pagination.pages}
            </span>
            <button
              className="text-muted-foreground disabled:opacity-40"
              disabled={page >= txPage.pagination.pages}
              onClick={() => setPage((p) => p + 1)}
            >
              Next
            </button>
          </div>
        )}
      </TabsContent>
    </Tabs>
  );
}