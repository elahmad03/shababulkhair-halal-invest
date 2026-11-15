"use client";

import type { Cycle } from "@/store/modules/cycle/cycle.types";
import type { WalletBalance as Wallet } from "@/store/modules/wallet/Wallet.types";
import InvestmentCheckoutForm from "./InvestmentCheckoutForm";

interface InvestmentFormProps {
  cycle: Cycle;
  wallet: Wallet;
}

/**
 * InvestmentForm adapter wrapping InvestmentCheckoutForm for backwards compatibility.
 */
export function InvestmentForm({ cycle, wallet }: InvestmentFormProps) {
  return <InvestmentCheckoutForm cycle={cycle} wallet={wallet} />;
}

export default InvestmentForm;
