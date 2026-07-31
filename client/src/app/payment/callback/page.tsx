import { Suspense } from "react";
import PaymentCallbackClient from "./PaymentCallBackClient";

// Next 16: searchParams is now a Promise and must be awaited.
export default async function PaymentCallbackPage({
  searchParams,
}: {
  searchParams: Promise<{ reference?: string; trxref?: string }>;
}) {
  const params = await searchParams;
  // Paystack sends both `reference` and `trxref` (same value) — prefer
  // `reference` since that's what we generated and stored.
  const reference = params.reference || params.trxref || null;

  return (
    <Suspense
      fallback={
        <div className="flex min-h-screen items-center justify-center">
          <p className="text-sm text-muted-foreground">Loading…</p>
        </div>
      }
    >
      <PaymentCallbackClient reference={reference} />
    </Suspense>
  );
}