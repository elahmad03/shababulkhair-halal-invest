// app/admin/users/[id]/page.tsx
"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { useGetUserQuery } from "@/store/modules/user/userApi";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { UserProfileCard } from "@/components/admin/users/[id]/user-profile-card";
import { UserKycCard } from "@/components/admin/users/[id]/user-kyc-card";
import { UserFinancialsTabs } from "@/components/admin/users/[id]/user-financial-tabs";
import { accountTone, currencyForCountry, titleCase, toneClass } from "@/components/admin/users/utils";

export default function AdminUserDetailPage() {
  const { id } = useParams<{ id: string }>();
  const { data: user, isLoading, isError } = useGetUserQuery(id);

  if (isLoading) {
    return (
      <div className="flex-1 space-y-4 p-4 pt-6 md:p-8">
        <Skeleton className="h-8 w-56" />
        <div className="grid gap-4 lg:grid-cols-3">
          <Skeleton className="h-72 rounded-xl lg:col-span-1" />
          <Skeleton className="h-72 rounded-xl lg:col-span-2" />
        </div>
      </div>
    );
  }

  if (isError || !user) {
    return (
      <div className="flex flex-1 flex-col items-center justify-center gap-2 p-10 text-center">
        <p className="font-medium">We couldn&apos;t find this member</p>
        <p className="text-sm text-muted-foreground">
          They may not exist, or you may not have access to view them.
        </p>
        <Link href="/admin/users" className="mt-2 inline-flex items-center gap-1.5 text-sm text-primary">
          <ArrowLeft className="h-3.5 w-3.5" />
          Back to members
        </Link>
      </div>
    );
  }

  const currency = currencyForCountry(user.kyc?.countryCode);

  return (
    <div className="flex-1 space-y-4 p-4 pt-6 md:p-8">
      <Link
        href="/admin/users"
        className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground"
      >
        <ArrowLeft className="h-3.5 w-3.5" />
        Back to members
      </Link>

      <div className="flex flex-wrap items-center gap-3">
        <h2 className="text-2xl font-bold tracking-tight sm:text-3xl">
          {user.firstName} {user.lastName}
        </h2>
        <Badge className={toneClass(accountTone(user.status))}>{titleCase(user.status)}</Badge>
      </div>
      <p className="text-sm text-muted-foreground">Member profile and KYC</p>

      <div className="grid gap-4 md:grid-cols-1 lg:grid-cols-3">
        {/* Left column */}
        <aside className="space-y-4 lg:sticky lg:top-6 lg:col-span-1 lg:self-start">
          <UserProfileCard user={user} />
          <UserKycCard user={user} />
        </aside>

        {/* Right column */}
        <main className="lg:col-span-2">
          <UserFinancialsTabs userId={user.id} currency={currency} />
        </main>
      </div>
    </div>
  );
}