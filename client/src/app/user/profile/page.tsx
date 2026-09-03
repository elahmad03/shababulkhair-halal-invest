// app/profile/page.tsx
"use client";

import {
  BadgeCheck,
  CalendarDays,
  IdCard,
  Mail,
  MapPin,
  Phone,
  ShieldCheck,
  Users,
  Wallet as WalletIcon,
} from "lucide-react";
import {
  useGetMeQuery,
  useGetUserKycQuery,
  useGetUserInvestmentsQuery,
  useGetUserTransactionsQuery,
} from "@/store/modules/user/userApi";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { cn } from "@/lib/utils";

// ---- formatting helpers --------------------------------------------------

function initials(first?: string, last?: string) {
  return `${first?.[0] ?? ""}${last?.[0] ?? ""}`.toUpperCase() || "?";
}

function titleCase(value?: string) {
  if (!value) return "—";
  return value
    .toLowerCase()
    .split(/[_\s]+/)
    .map((w) => w[0]?.toUpperCase() + w.slice(1))
    .join(" ");
}

// The API doesn't return a wallet currency — infer it from the member's
// country so a Nigerian member sees ₦ rather than a hardcoded $.
function currencyForCountry(code?: string) {
  return code === "NG" ? "NGN" : "USD";
}

function money(amount: number | string | undefined, currencyCode = "NGN") {
  const value = typeof amount === "string" ? Number(amount) : amount;
  if (value === undefined || Number.isNaN(value)) return "—";
  return new Intl.NumberFormat(currencyCode === "NGN" ? "en-NG" : "en-US", {
    style: "currency",
    currency: currencyCode,
    maximumFractionDigits: 2,
  }).format(value);
}

function formatDate(
  iso?: string,
  opts: Intl.DateTimeFormatOptions = { day: "numeric", month: "short", year: "numeric" }
) {
  if (!iso) return "—";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "—";
  return new Intl.DateTimeFormat("en-GB", opts).format(d);
}

function statusTone(kind: "kyc" | "investment" | "transaction", value?: string) {
  const v = (value ?? "").toUpperCase();
  const success = "border-transparent bg-emerald-500/10 text-emerald-600 dark:text-emerald-400";
  const warning = "border-transparent bg-amber-500/10 text-amber-600 dark:text-amber-400";
  const danger = "border-transparent bg-destructive/10 text-destructive";
  const neutral = "border-transparent bg-muted text-muted-foreground";

  if (kind === "kyc") {
    if (["APPROVED", "VERIFIED"].includes(v)) return success;
    if (["PENDING", "SUBMITTED", "IN_REVIEW"].includes(v)) return warning;
    if (v === "REJECTED") return danger;
  }
  if (kind === "investment" || kind === "transaction") {
    if (["ACTIVE", "CONFIRMED", "COMPLETED", "SUCCESS"].includes(v)) return success;
    if (["PENDING", "PROCESSING"].includes(v)) return warning;
    if (["FAILED", "REJECTED", "CANCELLED"].includes(v)) return danger;
  }
  return neutral;
}

// Cloudinary "authenticated" delivery URLs, as returned by the API, already
// carry a signed token (the s--xxxx-- segment) and are viewable as-is for a
// window of time. If/when the backend's signed-URL endpoint needs to be
// called instead (e.g. once tokens expire), this is the one place to change —
// swap the body for a call to that endpoint and every call site below still works.
function resolveDocumentUrl(url?: string | null) {
  return url ?? undefined;
}

// ---- small building blocks -----------------------------------------------

function Stat({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="flex flex-col items-center gap-0.5 py-3">
      <span className="text-base font-semibold tabular-nums">{value}</span>
      <span className="text-xs text-muted-foreground">{label}</span>
    </div>
  );
}

function InfoRow({
  icon: Icon,
  label,
  value,
}: {
  icon: React.ElementType;
  label: string;
  value?: React.ReactNode;
}) {
  return (
    <div className="flex items-center gap-3 py-3 first:pt-0 last:pb-0">
      <div className="flex h-8 w-8 flex-none items-center justify-center rounded-full bg-muted">
        <Icon className="h-4 w-4 text-muted-foreground" />
      </div>
      <div className="min-w-0 flex-1">
        <p className="text-xs text-muted-foreground">{label}</p>
        <p className="truncate text-sm font-medium">{value || "Not provided"}</p>
      </div>
    </div>
  );
}

function DocumentThumb({ label, src }: { label: string; src?: string }) {
  if (!src) {
    return (
      <div className="flex aspect-[3/2] flex-col items-center justify-center gap-1 rounded-lg border border-dashed bg-muted/40 text-xs text-muted-foreground">
        <IdCard className="h-4 w-4" />
        {label} not on file
      </div>
    );
  }

  return (
    <a
      href={src}
      target="_blank"
      rel="noopener noreferrer"
      className="group flex flex-col gap-1.5"
      aria-label={`Open ${label} in full size`}
    >
      <div className="aspect-[3/2] overflow-hidden rounded-lg border bg-muted">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={src}
          alt={label}
          className="h-full w-full object-cover transition group-hover:opacity-90"
        />
      </div>
      <span className="text-xs text-muted-foreground group-hover:text-foreground">{label}</span>
    </a>
  );
}

// ---- page -----------------------------------------------------------------

export default function ProfilePage() {
  const { data: user, isLoading, isError } = useGetMeQuery();

  const { data: kyc } = useGetUserKycQuery(user?.id ?? "", { skip: !user?.id });
  const { data: investments, isLoading: investmentsLoading } = useGetUserInvestmentsQuery(
    user?.id ?? "",
    { skip: !user?.id }
  );
  const { data: txPage, isLoading: transactionsLoading } = useGetUserTransactionsQuery(
    { id: user?.id ?? "", page: 1, limit: 10 },
    { skip: !user?.id }
  );

  if (isLoading) {
    return (
      <div className="mx-auto flex max-w-2xl flex-col items-center gap-4 p-6">
        <Skeleton className="h-28 w-full rounded-2xl" />
        <Skeleton className="-mt-14 h-24 w-24 rounded-full ring-4 ring-background" />
        <Skeleton className="h-5 w-40" />
        <Skeleton className="h-4 w-56" />
      </div>
    );
  }

  if (isError || !user) {
    return (
      <div className="mx-auto flex max-w-2xl flex-col items-center gap-1 p-10 text-center">
        <p className="font-medium">We couldn&apos;t load your profile</p>
        <p className="text-sm text-muted-foreground">Check your connection and try again.</p>
      </div>
    );
  }

  const kycStatus = kyc?.status ?? user.kyc?.status;
  const isVerified = ["APPROVED", "VERIFIED"].includes((kycStatus ?? "").toUpperCase());
  const fullName = `${user.firstName} ${user.lastName}`;
  const location = [user.kyc?.city, user.kyc?.stateRegion].filter(Boolean).join(", ");
  const currency = currencyForCountry(user.kyc?.countryCode);
  // Avatar always comes from the KYC record, per product decision — the
  // top-level user.avatarUrl is a denormalized copy and may lag.
  const avatarSrc = resolveDocumentUrl(user.kyc?.avatarUrl ?? user.avatarUrl);
  const idFrontSrc = resolveDocumentUrl(user.kyc?.idCardFrontUrl);
  const idBackSrc = resolveDocumentUrl(user.kyc?.idCardBackUrl);

  return (
    <div className="mx-auto max-w-2xl bg-background pb-10 text-foreground">
      {/* ---- Identity header ---- */}
      <div className="relative">
        <div className="h-28 rounded-b-2xl bg-gradient-to-br from-primary/15 via-primary/5 to-transparent sm:h-32" />

        <div className="-mt-12 flex flex-col items-center px-4 sm:-mt-14">
          <div className="relative">
            <Avatar className="h-24 w-24 ring-4 ring-background sm:h-28 sm:w-28">
              <AvatarImage src={avatarSrc} alt={fullName} />
              <AvatarFallback className="text-xl font-semibold">
                {initials(user.firstName, user.lastName)}
              </AvatarFallback>
            </Avatar>
            {isVerified && (
              <span className="absolute bottom-1 right-1 rounded-full bg-background p-0.5">
                <BadgeCheck className="h-6 w-6 fill-emerald-500 text-background" />
              </span>
            )}
          </div>

          <h1 className="mt-3 text-xl font-semibold tracking-tight sm:text-2xl">{fullName}</h1>
          <p className="text-sm text-muted-foreground">{user.email}</p>

          <div className="mt-3 flex flex-wrap items-center justify-center gap-x-4 gap-y-1.5 text-sm text-muted-foreground">
            <span className="inline-flex items-center gap-1">
              <ShieldCheck className="h-3.5 w-3.5" />
              {titleCase(user.role)}
            </span>
            {location && (
              <span className="inline-flex items-center gap-1">
                <MapPin className="h-3.5 w-3.5" />
                {location}
              </span>
            )}
            <span className="inline-flex items-center gap-1">
              <CalendarDays className="h-3.5 w-3.5" />
              Joined {formatDate(user.createdAt, { month: "long", year: "numeric" })}
            </span>
          </div>
        </div>
      </div>

      {/* ---- Quiet stat strip ---- */}
      <div className="mx-4 mt-6 grid grid-cols-3 divide-x divide-border rounded-xl border">
        <Stat label="Wallet" value={money(user.wallet?.balance, currency)} />
        <Stat label="Investments" value={user._count?.investments ?? investments?.length ?? 0} />
        <Stat label="Ledger entries" value={user._count?.ledgerEntries ?? "—"} />
      </div>

      {/* ---- Sections ---- */}
      <div className="mt-6 px-4">
        <Tabs defaultValue="overview">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="wallet">Wallet</TabsTrigger>
            <TabsTrigger value="investments">Investments</TabsTrigger>
          </TabsList>

          {/* Overview */}
          <TabsContent value="overview" className="flex flex-col gap-4">
            <Card>
              <CardHeader className="pb-1">
                <CardTitle className="text-sm text-muted-foreground">Contact</CardTitle>
              </CardHeader>
              <CardContent className="divide-y divide-border">
                <InfoRow icon={Mail} label="Email" value={user.email} />
                <InfoRow icon={Phone} label="Phone" value={user.phoneNumber} />
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex-row items-center justify-between space-y-0 pb-1">
                <CardTitle className="text-sm text-muted-foreground">Verification</CardTitle>
                <Badge className={cn(statusTone("kyc", kycStatus))}>{titleCase(kycStatus)}</Badge>
              </CardHeader>
              <CardContent className="divide-y divide-border">
                <InfoRow
                  icon={IdCard}
                  label="Government ID"
                  value={titleCase(user.kyc?.governmentIdType)}
                />
                <InfoRow
                  icon={CalendarDays}
                  label="Date of birth"
                  value={formatDate(user.kyc?.dateOfBirth)}
                />
                {isVerified && (
                  <InfoRow
                    icon={BadgeCheck}
                    label="Verified on"
                    value={formatDate(kyc?.verificationDate ?? user.kyc?.verificationDate)}
                  />
                )}
              </CardContent>

              {(idFrontSrc || idBackSrc) && (
                <CardContent className="grid grid-cols-2 gap-3 border-t pt-4">
                  <DocumentThumb label="ID front" src={idFrontSrc} />
                  <DocumentThumb label="ID back" src={idBackSrc} />
                </CardContent>
              )}
            </Card>

            <Card>
              <CardHeader className="pb-1">
                <CardTitle className="text-sm text-muted-foreground">Address</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm">
                  {[
                    user.kyc?.streetAddress,
                    user.kyc?.city,
                    user.kyc?.stateRegion,
                    user.kyc?.countryCode,
                  ]
                    .filter(Boolean)
                    .join(", ") || "Not provided"}
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-1">
                <CardTitle className="text-sm text-muted-foreground">Next of kin</CardTitle>
              </CardHeader>
              <CardContent className="divide-y divide-border">
                <InfoRow icon={Users} label="Name" value={user.kyc?.nextOfKinName} />
                <InfoRow
                  icon={Users}
                  label="Relationship"
                  value={titleCase(user.kyc?.nextOfKinRelationship)}
                />
                <InfoRow icon={Phone} label="Phone" value={user.kyc?.nextOfKinPhone} />
              </CardContent>
            </Card>
          </TabsContent>

          {/* Wallet */}
          <TabsContent value="wallet" className="flex flex-col gap-4">
            <Card>
              <CardContent className="flex items-center justify-between pt-6">
                <div>
                  <p className="text-xs text-muted-foreground">Available balance</p>
                  <p className="text-2xl font-semibold tabular-nums">
                    {money(user.wallet?.balance, currency)}
                  </p>
                </div>
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-muted">
                  <WalletIcon className="h-5 w-5 text-muted-foreground" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-1">
                <CardTitle className="text-sm text-muted-foreground">Recent transactions</CardTitle>
              </CardHeader>
              <CardContent className="divide-y divide-border">
                {transactionsLoading ? (
                  <Skeleton className="my-2 h-14 w-full rounded-lg" />
                ) : txPage && txPage.data.length > 0 ? (
                  txPage.data.map((tx) => (
                    <div key={tx.id} className="flex items-center justify-between gap-3 py-3">
                      <div className="min-w-0">
                        <p className="truncate text-sm font-medium">{tx.description}</p>
                        <p className="text-xs text-muted-foreground">{formatDate(tx.createdAt)}</p>
                      </div>
                      <div className="flex flex-none flex-col items-end gap-1">
                        <p className="font-mono text-sm tabular-nums">{money(tx.amount, tx.currency)}</p>
                        <Badge className={cn(statusTone("transaction", tx.status))}>
                          {titleCase(tx.status)}
                        </Badge>
                      </div>
                    </div>
                  ))
                ) : (
                  <p className="py-6 text-center text-sm text-muted-foreground">No transactions yet.</p>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Investments */}
          <TabsContent value="investments" className="flex flex-col gap-3">
            {investmentsLoading ? (
              <Skeleton className="h-20 w-full rounded-xl" />
            ) : investments && investments.length > 0 ? (
              investments.map((inv) => (
                <Card key={inv.id}>
                  <CardHeader className="flex-row items-start justify-between space-y-0 pb-2">
                    <div>
                      <CardTitle className="text-base">{inv.venture.name}</CardTitle>
                      <p className="text-sm text-muted-foreground">{inv.cycle.name}</p>
                    </div>
                    <Badge className={cn(statusTone("investment", inv.status))}>
                      {titleCase(inv.status)}
                    </Badge>
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
              <p className="py-8 text-center text-sm text-muted-foreground">
                No investments yet. Once you back a venture, it will show up here.
              </p>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}