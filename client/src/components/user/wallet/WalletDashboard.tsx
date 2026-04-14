"use client";

import { useGetWalletSummaryQuery } from "@/store/modules/wallet/walletApi";
import WalletOverview from "./WalletOverview";
import TransactionHistory from "./TransactionHistory";
import { Skeleton } from "@/components/ui/skeleton";

export default function WalletDashboard() {
  const { data, isLoading, isError, refetch } = useGetWalletSummaryQuery();

  if (isLoading) return <WalletSkeleton />;
  if (isError || !data?.success) {
    return (
      <div className="p-6 text-center text-red-500 bg-red-50 rounded-lg">
        Failed to load wallet data. <button onClick={refetch} className="underline">Try again</button>
      </div>
    );
  }

  const wallet = data.data;

  return (
    <div className="grid gap-6 grid-cols-1 lg:grid-cols-3">
      {/* Left Column: Balances and Actions */}
      <div className="lg:col-span-1 space-y-6">
        <WalletOverview 
          balanceKobo={wallet.balanceKobo} 
          lockedBalanceKobo={wallet.lockedBalanceKobo} 
        />
      </div>

      {/* Right Column: Ledger / History */}
      <div className="lg:col-span-2">
        <TransactionHistory transactions={wallet.recentTransactions} />
      </div>
    </div>
  );
}

function WalletSkeleton() {
  return (
    <div className="grid gap-6 grid-cols-1 lg:grid-cols-3">
      <Skeleton className="h-[250px] rounded-xl lg:col-span-1" />
      <Skeleton className="h-[500px] rounded-xl lg:col-span-2" />
    </div>
  );
}