"use client";

import Link from "next/link";
import { ArrowRight, Clock3, IdCard, ShieldAlert } from "lucide-react";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useGetMeQuery } from "@/store/modules/user/userApi";

type KycState = "NOT_SUBMITTED" | "PENDING_REVIEW" | "VERIFIED" | "REJECTED";

// Same keyword matching as the users table, so unknown backend values never mislabel
export function resolveKycState(raw?: string): KycState | null {
  if (!raw) return "NOT_SUBMITTED";
  const value = raw.toUpperCase();
  if (value.includes("VERIF") || value.includes("APPROV")) return "VERIFIED";
  if (value.includes("REJECT") || value.includes("FAIL")) return "REJECTED";
  if (value.includes("PEND") || value.includes("SUBMIT") || value.includes("REVIEW"))
    return "PENDING_REVIEW";
  return null;
}

const stateConfig: Record<
  Exclude<KycState, "VERIFIED">,
  {
    icon: typeof IdCard;
    title: string;
    description: string;
    cta?: string;
    container: string;
    iconWrap: string;
  }
> = {
  NOT_SUBMITTED: {
    icon: IdCard,
    title: "Verify your identity",
    description:
      "Submit your KYC documents to unlock investing and withdrawals. It only takes a few minutes.",
    cta: "Submit documents",
    container: "border-primary/30 bg-primary/5",
    iconWrap: "bg-primary/10 text-primary",
  },
  REJECTED: {
    icon: ShieldAlert,
    title: "Verification unsuccessful",
    description:
      "We couldn't verify your documents. Please review them and submit again.",
    cta: "Resubmit documents",
    container: "border-destructive/30 bg-destructive/5",
    iconWrap: "bg-destructive/10 text-destructive",
  },
  PENDING_REVIEW: {
    icon: Clock3,
    title: "Verification in progress",
    description:
      "Your documents are being reviewed. We'll notify you once the review is complete.",
    container: "border-border bg-muted/50",
    iconWrap: "bg-muted text-muted-foreground",
  },
};

interface KycPromptProps {
  /** Route of your member KYC submission page */
  href: string;
  className?: string;
}

export function KycPrompt({ href, className }: KycPromptProps) {
  const { data: me, isLoading } = useGetMeQuery();

  if (isLoading || !me || me.role === "ADMIN") return null;

  const state = resolveKycState(me.kyc?.status);
  if (!state || state === "VERIFIED") return null;

  const config = stateConfig[state];
  const Icon = config.icon;

  return (
    <section
      role="status"
      className={cn(
        "flex flex-col gap-4 rounded-xl border p-4 sm:flex-row sm:items-center sm:justify-between sm:p-5",
        config.container,
        className
      )}
    >
      <div className="flex items-start gap-3">
        <div
          className={cn(
            "flex size-10 shrink-0 items-center justify-center rounded-full",
            config.iconWrap
          )}
        >
          <Icon className="size-5" />
        </div>

        <div className="flex min-w-0 flex-col gap-1">
          <h2 className="text-sm font-semibold text-foreground">{config.title}</h2>
          <p className="text-sm text-muted-foreground">{config.description}</p>
        </div>
      </div>

      {config.cta && (
        <Button asChild className="w-full shrink-0 sm:w-auto">
          <Link href={href}>
            {config.cta}
            <ArrowRight className="ml-1.5 size-4" />
          </Link>
        </Button>
      )}
    </section>
  );
}
