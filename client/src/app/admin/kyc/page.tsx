"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { format } from "date-fns";
import {
  AlertCircle,
  ArrowUpRight,
  CheckCircle2,
  ClipboardList,
  Clock3,
  DivideIcon,
  Search,
  ShieldCheck,
  Users,
} from "lucide-react";

import { useGetPendingKycQuery } from "@/store/modules/kyc/adminKycApi";

import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";

function getInitials(firstName: string, lastName: string) {
  return `${firstName?.[0] ?? ""}${lastName?.[0] ?? ""}`.toUpperCase() || "U";
}

function formatDate(date: string) {
  const parsed = new Date(date);

  if (Number.isNaN(parsed.getTime())) return "Date unavailable";

  return format(parsed, "dd MMM yyyy");
}

function KycStatusBadge({ status }: { status: string }) {
  switch (status) {
    case "PENDING_REVIEW":
      return (
        <Badge variant="secondary" className="gap-1.5 font-medium">
          <Clock3 className="h-3 w-3" />
          Pending review
        </Badge>
      );

    case "VERIFIED":
      return (
        <Badge variant="secondary" className="gap-1.5 font-medium">
          <CheckCircle2 className="h-3 w-3" />
          Verified
        </Badge>
      );

    case "REJECTED":
      return (
        <Badge variant="destructive" className="gap-1.5 font-medium">
          Rejected
        </Badge>
      );

    case "NOT_SUBMITTED":
      return <Badge variant="outline">Not submitted</Badge>;

    default:
      return <Badge variant="outline">{status.replaceAll("_", " ")}</Badge>;
  }
}

function KycCardSkeleton() {
  return (
    <Card>
      <CardContent className="flex flex-col gap-5 p-5 sm:p-6">
        <div className="flex items-start gap-4">
          <Skeleton className="h-12 w-12 shrink-0 rounded-full" />
          <div className="min-w-0 flex-1 space-y-2">
            <Skeleton className="h-5 w-40 max-w-full" />
            <Skeleton className="h-4 w-52 max-w-full" />
          </div>
          <Skeleton className="h-6 w-24 shrink-0 rounded-full" />
        </div>

        <div className="grid grid-cols-2 gap-4 border-t pt-4">
          <div className="space-y-2">
            <Skeleton className="h-3 w-20" />
            <Skeleton className="h-4 w-28 max-w-full" />
          </div>
          <div className="space-y-2">
            <Skeleton className="h-3 w-16" />
            <Skeleton className="h-4 w-12" />
          </div>
        </div>

        <Skeleton className="h-9 w-full rounded-md" />
      </CardContent>
    </Card>
  );
}

export default function AdminKycListPage() {
  const router = useRouter();
  const [search, setSearch] = useState("");

  const { data, isLoading, isError, refetch, isFetching } =
    useGetPendingKycQuery();

  const items = data?.data ?? [];

  const filteredItems = useMemo(() => {
    const query = search.trim().toLowerCase();

    if (!query) return items;

    return items.filter((kyc) => {
      const fullName =
        `${kyc.user.firstName} ${kyc.user.lastName}`.toLowerCase();

      return (
        fullName.includes(query) ||
        kyc.user.email.toLowerCase().includes(query) ||
        kyc.kycStatus.toLowerCase().replaceAll("_", " ").includes(query) ||
        String(kyc.version).includes(query)
      );
    });
  }, [items, search]);

  return (
    <main className="mx-auto w-full max-w-7xl space-y-6 p-4 sm:p-6 lg:p-8">
      {/* Page heading */}
      <section className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-start gap-3">
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border bg-muted/50">
            <ShieldCheck className="h-5 w-5 text-primary" />
          </div>

          <div className="space-y-1">
            <h1 className="text-2xl font-semibold tracking-tight">
              KYC reviews
            </h1>
            <div className="text-sm text-muted-foreground">
              Review submitted identity information and verify applicants.
            </div>
          </div>
        </div>

        <Button
          variant="outline"
          className="w-full gap-2 sm:w-auto"
          onClick={() => refetch()}
          disabled={isFetching}
        >
          <ClipboardList
            className={`h-4 w-4 ${isFetching ? "animate-pulse" : ""}`}
          />
          Refresh submissions
        </Button>
      </section>

      {/* Summary */}
      <section className="grid gap-4 sm:grid-cols-2">
        <Card>
          <CardContent className="flex items-center gap-4 p-5">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
              <Users className="h-5 w-5 text-primary" />
            </div>
            <div className="min-w-0">
              <div className="text-sm text-muted-foreground">
                Pending submissions
              </div>
              <div className="text-2xl font-semibold tabular-nums">
                {isLoading ? (
                  <Skeleton className="mt-1 h-7 w-12" />
                ) : (
                  items.length
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="flex items-center gap-4 p-5">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-muted">
              <ClipboardList className="h-5 w-5 text-muted-foreground" />
            </div>
            <div className="min-w-0">
              <div className="text-sm text-muted-foreground">
                Matching applicants
              </div>
              <div className="text-2xl font-semibold tabular-nums">
                {isLoading ? (
                  <Skeleton className="mt-1 h-7 w-12" />
                ) : (
                  filteredItems.length
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      </section>

      {/* Applicant list */}
      <section className="space-y-4">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="text-lg font-semibold tracking-tight">Applicants</h2>
            <div className="text-sm text-muted-foreground">
              Select an applicant to inspect their submission.
            </div>
          </div>

          <div className="relative w-full sm:max-w-sm">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Search name, email, status..."
              className="pl-9"
              aria-label="Search KYC applicants"
            />
          </div>
        </div>

        {isError ? (
          <Card className="border-destructive/30">
            <CardContent className="flex flex-col items-center gap-3 p-8 text-center sm:p-10">
              <div className="flex h-11 w-11 items-center justify-center rounded-full bg-destructive/10">
                <AlertCircle className="h-5 w-5 text-destructive" />
              </div>
              <div className="space-y-1">
                <h3 className="font-semibold">Unable to load submissions</h3>
                <div className="text-sm text-muted-foreground">
                  Something went wrong while retrieving pending KYC reviews.
                </div>
              </div>
              <Button variant="outline" onClick={() => refetch()}>
                Try again
              </Button>
            </CardContent>
          </Card>
        ) : isLoading ? (
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {Array.from({ length: 6 }).map((_, index) => (
              <KycCardSkeleton key={index} />
            ))}
          </div>
        ) : filteredItems.length === 0 ? (
          <Card>
            <CardContent className="flex flex-col items-center gap-3 px-6 py-14 text-center">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-muted">
                {search ? (
                  <Search className="h-5 w-5 text-muted-foreground" />
                ) : (
                  <CheckCircle2 className="h-5 w-5 text-muted-foreground" />
                )}
              </div>

              <div className="space-y-1">
                <h3 className="font-semibold">
                  {search ? "No matching applicants" : "You're all caught up"}
                </h3>
                <div className="max-w-sm text-sm text-muted-foreground">
                  {search
                    ? "Try another name, email address, status, or version."
                    : "There are no pending KYC submissions to review right now."}
                </div>
              </div>

              {search && (
                <Button
                  variant="outline"
                  onClick={() => setSearch("")}
                  className="mt-1"
                >
                  Clear search
                </Button>
              )}
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {filteredItems.map((kyc) => {
              const fullName =
                `${kyc.user.firstName} ${kyc.user.lastName}`.trim();

              return (
                <Card
                  key={kyc.id}
                  className="group flex min-w-0 flex-col transition-colors hover:border-primary/40"
                >
                  <CardHeader className="space-y-4 pb-4">
                    <div className="flex min-w-0 items-start gap-3">
                      <Avatar className="h-12 w-12 shrink-0 border">
                        <AvatarFallback className="bg-muted text-sm font-semibold">
                          {getInitials(kyc.user.firstName, kyc.user.lastName)}
                        </AvatarFallback>
                      </Avatar>

                      <div className="min-w-0 flex-1 pt-0.5">
                        <h3 className="truncate font-semibold leading-5">
                          {fullName || "Unnamed applicant"}
                        </h3>
                        <p className="mt-1 break-words text-sm text-muted-foreground">
                          {kyc.user.email}
                        </p>
                      </div>
                    </div>

                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <KycStatusBadge status={kyc.kycStatus} />
                      <span className="text-xs text-muted-foreground">
                        Submission v{kyc.version}
                      </span>
                    </div>
                  </CardHeader>

                  <CardContent className="mt-auto space-y-4">
                    <div className="grid grid-cols-2 gap-4 rounded-lg border bg-muted/20 p-3">
                      <div className="min-w-0">
                        <p className="text-xs text-muted-foreground">
                          Submitted
                        </p>
                        <p className="mt-1 text-sm font-medium">
                          {formatDate(kyc.createdAt)}
                        </p>
                      </div>

                      <div className="min-w-0">
                        <p className="text-xs text-muted-foreground">
                          Applicant ID
                        </p>
                        <p
                          className="mt-1 truncate font-mono text-xs text-muted-foreground"
                          title={kyc.userId}
                        >
                          {kyc.userId}
                        </p>
                      </div>
                    </div>

                    <Button
                      className="w-full justify-between"
                      variant="outline"
                      onClick={() => router.push(`/admin/kyc/${kyc.id}`)}
                    >
                      Review submission
                      <ArrowUpRight className="h-4 w-4 transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
                    </Button>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}
      </section>
    </main>
  );
}
