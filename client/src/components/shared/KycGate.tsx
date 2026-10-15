"use client";

import { useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";

import { useGetMeQuery } from "@/store/modules/user/userApi";
import { resolveKycState } from "@/components/shared/KycPrompt";
import { BrandLoader } from "@/components/shared/BrandLoader";

const KYC_ROUTE = "/user/onboarding/kyc";
const ONBOARDING_PREFIX = "/user/onboarding";

export function KycGate({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const { data: me, isLoading } = useGetMeQuery();

  const isOnboarding = pathname.startsWith(ONBOARDING_PREFIX);
  const needsKyc =
    !!me &&
    me.role !== "ADMIN" &&
    resolveKycState(me.kyc?.status) === "NOT_SUBMITTED";

  useEffect(() => {
    if (needsKyc && !isOnboarding) router.replace(KYC_ROUTE);
  }, [needsKyc, isOnboarding, router]);

  // Hold the page while we check, so users never see a flash of the dashboard
  if (isLoading || (needsKyc && !isOnboarding)) {
    return (
      <BrandLoader variant="page" />
    );
  }

  return <>{children}</>;
}