// components/wallet/WalletOverview.tsx
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { fetchWalletBalance, fetchCryptoWallet } from "@/store/slice/walletSlice";
import { useEffect } from "react";

export const WalletOverview = () => {
  const dispatch = useAppDispatch();
  const { wallet, cryptoWallet, loading, error } = useAppSelector((state) => state.wallet);

  useEffect(() => {
    dispatch(fetchWalletBalance());
    dispatch(fetchCryptoWallet());
  }, [dispatch]);

  const formatBalance = (balance: number | undefined) => {
    if (balance === undefined) return "---";
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
    }).format(balance);
  };

  const getTierBadge = (tier: number | undefined) => {
    if (!tier) return null;
    
    const tiers = {
      1: { label: "Basic", color: "bg-gray-500" },
      2: { label: "Silver", color: "bg-slate-500" },
      3: { label: "Gold", color: "bg-yellow-500" },
      4: { label: "Platinum", color: "bg-purple-500" },
    };

    const tierInfo = tiers[tier as keyof typeof tiers] || tiers[1];
    return <Badge className={`${tierInfo.color} ml-2`}>{tierInfo.label}</Badge>;
  };

  if (error) {
    return (
      <Card className="w-full">
        <CardHeader>
          <CardTitle>Wallet Error</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-red-500">{error}</p>
          <Button onClick={() => dispatch(fetchWalletBalance())} className="mt-4">
            Retry
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="grid gap-4 md:grid-cols-2">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            Fiat Wallet
            {getTierBadge(wallet?.tier)}
          </CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <Skeleton className="h-8 w-32" />
          ) : (
            <p className="text-2xl font-bold">{formatBalance(wallet?.balance)}</p>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Crypto Wallet</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="space-y-2">
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-3/4" />
            </div>
          ) : cryptoWallet ? (
            <div className="space-y-2">
              <p className="font-mono text-sm break-all">{cryptoWallet.address}</p>
              <Badge variant="outline">{cryptoWallet.network}</Badge>
            </div>
          ) : (
            <p className="text-muted-foreground">No crypto wallet connected</p>
          )}
        </CardContent>
      </Card>
    </div>
  );
};