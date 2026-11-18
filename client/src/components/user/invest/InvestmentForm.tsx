"use client";

import type { Cycle } from "@/store/modules/cycle/cycle.types";
import type { WalletBalance as Wallet } from "@/store/modules/wallet/Wallet.types";
import InvestmentCheckoutForm from "./InvestmentCheckoutForm";

export interface LegacyCycleInput extends Partial<Cycle> {
  name?: string;
  pricePerShare?: number | string;
}

export interface LegacyWalletInput extends Partial<Wallet> {
  balance?: number | string;
  balanceNaira?: number | string;
}

interface InvestmentFormProps {
  cycle: Cycle | LegacyCycleInput;
  wallet: Wallet | LegacyWalletInput;
}

/**
 * InvestmentForm adapter wrapping InvestmentCheckoutForm for backwards compatibility.
 * Normalizes legacy fields (e.g. wallet.balance, cycle.pricePerShare in Naira) before delegation.
 */
export function InvestmentForm({ cycle, wallet }: InvestmentFormProps) {
  const priceKoboStr =
    cycle.pricePerShareKobo != null
      ? cycle.pricePerShareKobo.toString()
      : cycle.pricePerShareNaira != null
      ? String(Math.round(Number(cycle.pricePerShareNaira) * 100))
      : (cycle as any).pricePerShare != null
      ? String(Math.round(Number((cycle as any).pricePerShare) * 100))
      : "1000000";

  const walletKoboStr =
    wallet.balanceKobo != null
      ? wallet.balanceKobo.toString()
      : (wallet as any).balanceNaira != null
      ? String(Math.round(Number((wallet as any).balanceNaira) * 100))
      : (wallet as any).balance != null
      ? String(Math.round(Number((wallet as any).balance) * 100))
      : "0";

  const normalizedCycle = {
    ...cycle,
    id: cycle.id || "",
    cycleName: cycle.cycleName || (cycle as any).name || "Investment Cycle",
    pricePerShareKobo: priceKoboStr,
  } as Cycle;

  const normalizedWallet = {
    ...wallet,
    balanceKobo: walletKoboStr,
    lockedBalanceKobo: wallet.lockedBalanceKobo || "0",
    totalKobo: wallet.totalKobo || walletKoboStr,
  } as Wallet;

  return <InvestmentCheckoutForm cycle={normalizedCycle} wallet={normalizedWallet} />;
}

export default InvestmentForm;
