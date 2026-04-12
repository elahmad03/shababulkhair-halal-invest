import { Metadata } from "next";
import WalletDashboard from "@/components/user/wallet/WalletDashboard";

export const metadata: Metadata = {
  title: "My Wallet | Venture Capital Engine",
  description: "Manage your investments, deposits, and withdrawals.",
};

export default function UserWalletPage() {
  return (
    <main className="container mx-auto py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight">Wallet</h1>
        <p className="text-muted-foreground text-sm mt-1">
          Manage your funds, deposit capital, and request withdrawals.
        </p>
      </div>
      
      {/* All logic is delegated to the component layer */}
      <WalletDashboard />
    </main>
  );
}