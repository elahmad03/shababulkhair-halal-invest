"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useGetTransactionStatusQuery } from "@/store/modules/wallet/walletApi";

// Poll every 2s for up to ~20s. The webhook usually lands within a second
// or two of the redirect, but we don't want to falsely report "failed"
// just because the webhook hasn't arrived yet.
const POLL_INTERVAL_MS = 2000;
const MAX_ATTEMPTS = 10;

export default function PaymentCallbackClient({
  reference,
}: {
  reference: string | null;
}) {
  const router = useRouter();
  const [attempts, setAttempts] = useState(0);

  const { data, isError } = useGetTransactionStatusQuery(reference as string, {
    skip: !reference,
    pollingInterval:
      attempts < MAX_ATTEMPTS ? POLL_INTERVAL_MS : 0, // stop polling once we hit the cap
  });

  const status = data?.data?.transactionStatus;

  // No reference at all — nothing to poll, bail immediately.
  useEffect(() => {
    if (!reference) {
      router.replace("/wallet?status=error&message=missing-reference");
    }
  }, [reference, router]);

  // Count attempts so we know when to give up waiting on a still-PENDING tx.
  useEffect(() => {
    if (!reference || status) return; // stop counting once we have a final status
    const timer = setTimeout(() => setAttempts((a) => a + 1), POLL_INTERVAL_MS);
    return () => clearTimeout(timer);
  }, [reference, status, attempts]);

  // Redirect once we know the outcome, or once we've waited long enough.
  useEffect(() => {
    if (!reference) return;

    if (status === "COMPLETED") {
      router.replace(`/wallet?status=success&reference=${reference}`);
    } else if (status === "FAILED") {
      router.replace(`/wallet?status=failed&reference=${reference}`);
    } else if (attempts >= MAX_ATTEMPTS) {
      // Still PENDING after ~20s — don't claim it failed, the webhook may
      // just be slow. Hand off to the wallet page, which can keep checking.
      router.replace(`/wallet?status=pending&reference=${reference}`);
    }
  }, [status, attempts, reference, router]);

  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-3 px-4 text-center">
      <div
        className="h-8 w-8 animate-spin rounded-full border-2 border-muted-foreground border-t-transparent"
        aria-hidden="true"
      />
      <p className="text-lg font-medium">Confirming your payment…</p>
      <p className="text-sm text-muted-foreground">
        This usually takes just a few seconds. Please don&apos;t close this page.
      </p>
      {isError && attempts < MAX_ATTEMPTS ? (
        <p className="text-xs text-muted-foreground">Still checking — hang tight.</p>
      ) : null}
    </div>
  );
}