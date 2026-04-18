import { Kobo } from "../shared/money";

type Investment = {
  userId: string;
  investmentId: string;
  sharesAllocated: bigint;
  amountInvestedKobo: Kobo;
};

export type Payout = {
  userId: string;
  investmentId: string;
  capitalKobo: Kobo;
  profitKobo: Kobo;
  totalKobo: Kobo;
};

export function calculatePayouts(params: {
  investments: Investment[];
  totalProfitKobo: Kobo;
  investorPercent: number;
}): {
  payouts: Payout[];
  investorPoolKobo: Kobo;
  orgShareKobo: Kobo;
  totalShares: bigint;
} {
  const { investments, totalProfitKobo, investorPercent } = params;

  const totalShares = investments.reduce(
    (sum, inv) => sum + inv.sharesAllocated,
    0n
  );

  if (totalShares === 0n) {
    throw new Error("Total shares cannot be zero");
  }

  const investorPoolKobo =
    (totalProfitKobo * BigInt(Math.round(investorPercent))) / 100n;

  const orgShareKobo = totalProfitKobo - investorPoolKobo;

  let distributed = 0n;

  const payouts = investments.map((inv, index) => {
    let profitShare =
      (investorPoolKobo * inv.sharesAllocated) / totalShares;

    // Handle rounding remainder (assign to last investor)
    if (index === investments.length - 1) {
      profitShare = investorPoolKobo - distributed;
    } else {
      distributed += profitShare;
    }

    return {
      userId: inv.userId,
      investmentId: inv.investmentId,
      capitalKobo: inv.amountInvestedKobo,
      profitKobo: profitShare,
      totalKobo: inv.amountInvestedKobo + profitShare,
    };
  });

  return {
    payouts,
    investorPoolKobo,
    orgShareKobo,
    totalShares,
  };
}