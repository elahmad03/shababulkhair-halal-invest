"use client";

import { useRouter } from "next/navigation";
import { format } from "date-fns";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { AlertCircle, ClipboardList, Eye } from "lucide-react";
import { useGetPendingKycQuery } from "@/store/modules/kyc/adminKycApi";

// ─── Status badge ─────────────────────────────────────────────────────────────

function KycStatusBadge({ status }: { status: string }) {
  const map: Record<string, { label: string; className: string }> = {
    PENDING_REVIEW: { label: "Pending",  className: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400" },
    VERIFIED:       { label: "Verified", className: "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400" },
    REJECTED:       { label: "Rejected", className: "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400" },
    NOT_SUBMITTED:  { label: "Not submitted", className: "bg-muted text-muted-foreground" },
  };

  const cfg = map[status] ?? { label: status, className: "bg-muted text-muted-foreground" };

  return (
    <Badge variant="outline" className={`border-0 font-medium ${cfg.className}`}>
      {cfg.label}
    </Badge>
  );
}

// ─── Skeleton rows ────────────────────────────────────────────────────────────

function SkeletonRows() {
  return (
    <>
      {Array.from({ length: 5 }).map((_, i) => (
        <TableRow key={i}>
          {Array.from({ length: 5 }).map((_, j) => (
            <TableCell key={j}>
              <Skeleton className="h-4 w-full" />
            </TableCell>
          ))}
        </TableRow>
      ))}
    </>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function AdminKycListPage() {
  const router = useRouter();
  const { data, isLoading, isError } = useGetPendingKycQuery();

  const items = data?.data ?? [];

  return (
    <div className="space-y-6 p-6 max-w-6xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center">
            <ClipboardList className="h-5 w-5 text-primary" />
          </div>
          <div>
            <h1 className="text-xl font-bold">KYC Reviews</h1>
            <p className="text-sm text-muted-foreground">
              {isLoading ? "Loading…" : `${items.length} pending submission${items.length !== 1 ? "s" : ""}`}
            </p>
          </div>
        </div>
      </div>

      {/* Error */}
      {isError && (
        <div className="flex items-center gap-2 rounded-lg border border-destructive/30 bg-destructive/5 p-4 text-sm text-destructive">
          <AlertCircle className="h-4 w-4 shrink-0" />
          Failed to load pending KYC submissions.
        </div>
      )}

      {/* Table */}
      <div className="rounded-xl border overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow className="bg-muted/40">
              <TableHead>Applicant</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Submitted</TableHead>
              <TableHead>Version</TableHead>
              <TableHead className="text-right">Action</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading && <SkeletonRows />}

            {!isLoading && items.length === 0 && (
              <TableRow>
                <TableCell colSpan={6} className="text-center py-16 text-muted-foreground">
                  <ClipboardList className="h-8 w-8 mx-auto mb-2 opacity-30" />
                  No pending KYC submissions
                </TableCell>
              </TableRow>
            )}

            {items.map((kyc) => (
              <TableRow key={kyc.id} className="hover:bg-muted/30 transition-colors">
                <TableCell className="font-medium">
                  {kyc.user.firstName} {kyc.user.lastName}
                </TableCell>
                <TableCell className="text-muted-foreground text-sm">
                  {kyc.user.email}
                </TableCell>
                <TableCell>
                  <KycStatusBadge status={kyc.kycStatus} />
                </TableCell>
                <TableCell className="text-sm text-muted-foreground">
                  {format(new Date(kyc.createdAt), "dd MMM yyyy, HH:mm")}
                </TableCell>
                <TableCell className="text-sm text-muted-foreground">
                  v{kyc.version}
                </TableCell>
                <TableCell className="text-right">
                  <Button
                    size="sm"
                    variant="outline"
                    className="gap-2"
                    onClick={() => router.push(`/admin/kyc/${kyc.id}`)}
                  >
                    <Eye className="h-3.5 w-3.5" />
                    Review
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}