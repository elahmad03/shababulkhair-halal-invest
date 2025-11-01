
import { mockUsers, mockWallets, mockTransactions } from "@/db/mockData";
import HeaderBox from "@/components/common/HeaderBox";
import TotalBalanceBox from "@/components/common/TotalBalanceBox";
import { WalletActions } from "@/components/wallet/walletActions";
import { TransactionHistory } from "@/components/wallet/recentTransactions";

// We'll use the mock data exports directly and transform them into shapes
// expected by UI components (numbers for amounts, Date objects for createdAt).

const CURRENT_USER_ID = 1;

type UiTransaction = {
  id: number;
  type: string;
  description: string | null;
  amount: number; // in Naira with 2 decimals (UI-friendly)
  status: 'completed' | 'pending' | 'failed';
  createdAt: Date;
};

function getUserWalletBalance(userId: number): number {
  const wallet = mockWallets.find((w) => w.userId === userId);
  if (!wallet) return 0;

  // mockWallets store balance as BigInt representing kobo (or assumed smallest unit).
  // Convert to a JS number in Naira (divide by 100 to get Naira if stored in kobo),
  // but some mock files already treat the BigInt as kobo-ish. To be safe we'll
  // convert BigInt -> number and divide by 100 to format for UI with 2 decimals.
  try {
    const raw = Number(wallet.balance);
    return raw / 100; // show Naira with 2 decimals
  } catch (e) {
    return 0;
  }
}

function getRecentTransactionsForUser(userId: number, limit = 5): UiTransaction[] {
  const txs = mockTransactions
    .filter((t) => t.userId === userId)
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    .slice(0, limit)
    .map((t) => ({
      id: t.id,
      type: t.type,
      description: t.description ?? null,
      // convert BigInt amounts to number in Naira with 2 decimals
      amount: typeof t.amount === 'bigint' ? Number(t.amount) / 100 : Number(t.amount) / 100,
      status: (t.status as 'completed' | 'pending' | 'failed') ?? 'completed',
      createdAt: new Date(t.createdAt),
    }));

  return txs;
}

export default function WalletPage() {
  const balance = getUserWalletBalance(CURRENT_USER_ID);
  const recentTransactions = getRecentTransactionsForUser(CURRENT_USER_ID, 8);

  return (
    <section className="p-4 md:p-8  space-y-6 md:space-y-8">
      <HeaderBox
        title="wallet"
        subtext="Manage your available funds and transactions."
      />

      <div className="bg-zinc-100 dark:bg-zinc-800 rounded-lg shadow p-4">
        <div className="mb-4">
          <TotalBalanceBox totalCurrentBalance={balance} />
        </div>

        <WalletActions />

        <div className="pt-4">
          <TransactionHistory transactions={recentTransactions} />
        </div>
      </div>
    </section>
  );
}
