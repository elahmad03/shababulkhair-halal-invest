// app/(app)/wallet/page.tsx
// This is a Server Component. It focuses on DATA FILTERING and COMPONENT COMPOSITION.

import { mockData } from "@/lib/data/mockData";
import { Separator } from "@/components/ui/separator";
import HeaderBox from "@/components/common/HeaderBox";
import TotalBalanceBox from "@/components/common/TotalBalanceBox";
import { WalletActions } from "@/components/wallet/walletActions";
import { TransactionHistory } from "@/components/wallet/recentTransactions";

// Import the necessary Zod schemas and define local types
import { TransactionSchema, WalletSchema, UserSchema } from "@/schemas/app";
import { z } from "zod";

type Transaction = z.infer<typeof TransactionSchema>;
type User = z.infer<typeof UserSchema>;
interface ParsedWallet {
  balance: number;
}

const CURRENT_USER_ID = 2;

interface WalletScreenData {
  userName: string;
  balance: number;
  recentTransactions: Transaction[];
}

/**
 * Function to process the raw mockData into a clean, usable structure.
 * Filtering and Zod transformation assumptions happen here.
 */
function processWalletData(userId: number): WalletScreenData {
  const { users, wallets, transactions } = mockData;

  // 1. Get User Name
  const user = users.find((u) => u.id === userId) as User;
  const userName = user?.fullName.split(" ")[0] || "Member";

  // 2. Get Wallet Balance (Assumes Zod transformation to number occurred during mockData load)
  const userWalletRaw = wallets.find(
    (w) => w.userId === userId
  ) as unknown as ParsedWallet;
  const balance = userWalletRaw ? userWalletRaw.balance : 0.0;

  // 3. Get Recent Transactions
  const recentTransactions: Transaction[] = transactions
    .filter((t) => t.userId === userId)
    .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())
    .slice(0, 5) as Transaction[];

  return {
    userName,
    balance,
    recentTransactions,
  };
}

export default async function WalletPage() {
  const walletData = processWalletData(CURRENT_USER_ID);

  return (
    <section className="p-4 md:p-8 max-w-7xl mx-auto space-y-6 md:space-y-8">
      <HeaderBox
        title="wallet"
        subtext="Manage your available funds and transactions."
      />

      {/* 1. Header and Balance (Grid Layout for responsiveness) */}
      <div className="bg-zinc-100 dark:bg-zinc-800 rounded-lg shadow p-4">
        <div className="mb-4">
          <TotalBalanceBox totalCurrentBalance={walletData.balance} />
        </div>

        <WalletActions />

        {/* 2. Recent Transactions (Full Width) */}
        <div className="pt-4">
          <TransactionHistory transactions={walletData.recentTransactions} />
        </div>
      </div>
    </section>
  );
}
