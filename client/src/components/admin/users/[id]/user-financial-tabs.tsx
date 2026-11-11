// components/admin/users/user-financial-tabs.tsx
"use client";

import { useState } from "react";
import { ArrowRight, History, Layers, UserCheck } from "lucide-react";
import { useGetUserInvestmentsQuery, useGetUserTransactionsQuery } from "@/store/modules/user/userApi";
import type { UserDetail } from "@/store/modules/user";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { formatDate, investmentTone, kycTone, money, titleCase, toneClass } from "../utils";

function formatFieldName(field: string): string {
  if (field.startsWith("kyc.")) {
    const raw = field.replace("kyc.", "");
    return "KYC: " + raw.replace(/([A-Z])/g, " $1").replace(/^./, (s) => s.toUpperCase());
  }
  return field.replace(/([A-Z])/g, " $1").replace(/^./, (s) => s.toUpperCase());
}

export function UserFinancialsTabs({
  userId,
  currency,
  user,
}: {
  userId: string;
  currency: string;
  user?: UserDetail;
}) {
  const [page, setPage] = useState(1);

  const { data: investments, isLoading: investmentsLoading } = useGetUserInvestmentsQuery(userId);
  const { data: txPage, isLoading: transactionsLoading } = useGetUserTransactionsQuery({
    id: userId,
    page,
    limit: 10,
  });

  const editLogs = user?.editLogs ?? [];
  const kycVersions = user?.kycVersions ?? [];

  return (
    <Tabs defaultValue="investments">
      <TabsList className="grid w-full grid-cols-3 sm:w-auto sm:inline-grid">
        <TabsTrigger value="investments">Investments</TabsTrigger>
        <TabsTrigger value="transactions">Transactions</TabsTrigger>
        <TabsTrigger value="audit">
          Audit & Versions
          {editLogs.length > 0 && (
            <Badge variant="secondary" className="ml-1.5 px-1.5 py-0 text-[10px] h-4">
              {editLogs.length}
            </Badge>
          )}
        </TabsTrigger>
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

      {/* Audit & Versions History */}
      <TabsContent value="audit" className="space-y-4">
        {/* KYC Version History */}
        <Card>
          <CardHeader className="pb-3">
            <div className="flex items-center gap-2">
              <Layers className="h-4 w-4 text-primary" />
              <CardTitle className="text-sm font-semibold">KYC Profile Version History</CardTitle>
            </div>
            <CardDescription className="text-xs">
              History of KYC document submissions and profile revisions for this member.
            </CardDescription>
          </CardHeader>
          <CardContent className="divide-y divide-border pt-0">
            {kycVersions.length > 0 ? (
              kycVersions.map((v) => (
                <div key={v.id} className="flex items-center justify-between py-2.5 text-xs">
                  <div className="flex items-center gap-2">
                    <span className="font-mono font-semibold">v{v.version}</span>
                    {v.isActive ? (
                      <Badge variant="outline" className="text-[10px] border-emerald-500/30 text-emerald-600 bg-emerald-500/10">
                        Active
                      </Badge>
                    ) : (
                      <Badge variant="outline" className="text-[10px] text-muted-foreground">
                        Archived
                      </Badge>
                    )}
                    <span className="text-muted-foreground">
                      Created: {formatDate(v.createdAt)}
                    </span>
                  </div>
                  <Badge className={toneClass(kycTone(v.status))}>
                    {titleCase(v.status)}
                  </Badge>
                </div>
              ))
            ) : (
              <p className="py-4 text-center text-xs text-muted-foreground">
                No KYC submission versions recorded yet.
              </p>
            )}
          </CardContent>
        </Card>

        {/* User Edit Log Audit Trail */}
        <Card>
          <CardHeader className="pb-3">
            <div className="flex items-center gap-2">
              <History className="h-4 w-4 text-primary" />
              <CardTitle className="text-sm font-semibold">Information Edit Audit Trail</CardTitle>
            </div>
            <CardDescription className="text-xs">
              Immutable record of all field modifications made to this user's account and KYC data.
            </CardDescription>
          </CardHeader>
          <CardContent className="divide-y divide-border pt-0">
            {editLogs.length > 0 ? (
              editLogs.map((log) => (
                <div key={log.id} className="py-3 text-xs space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="font-semibold text-foreground">
                      {formatFieldName(log.field)}
                    </span>
                    <span className="text-muted-foreground font-mono text-[11px]">
                      {formatDate(log.createdAt, {
                        day: "numeric",
                        month: "short",
                        year: "numeric",
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </span>
                  </div>

                  <div className="flex flex-wrap items-center gap-2 text-muted-foreground">
                    <span className="line-through bg-muted/60 px-1.5 py-0.5 rounded text-[11px]">
                      {log.oldValue || "empty"}
                    </span>
                    <ArrowRight className="h-3 w-3 text-muted-foreground" />
                    <span className="font-medium text-foreground bg-primary/10 px-1.5 py-0.5 rounded text-[11px]">
                      {log.newValue || "empty"}
                    </span>
                  </div>

                  {log.editedBy && (
                    <div className="flex items-center gap-1 text-[11px] text-muted-foreground pt-0.5">
                      <UserCheck className="h-3 w-3" />
                      <span>Edited by: {log.editedBy.fullName} ({log.editedBy.email})</span>
                    </div>
                  )}
                </div>
              ))
            ) : (
              <p className="py-6 text-center text-xs text-muted-foreground">
                No edits have been made to this member yet.
              </p>
            )}
          </CardContent>
        </Card>
      </TabsContent>
    </Tabs>
  );
}
