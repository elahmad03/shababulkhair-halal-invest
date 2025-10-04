"use client";

import { useEffect, useState } from "react";
import { ethers } from "ethers";
import { tokenAbi } from "@/lib/abi/Tokenabi";
import TokenInfo from "@/components/token/TokenInfo";
import TokenHoldersPage from "@/components/token/Holders";
import TokenTransfers from "@/components/token/TokenMonitor";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";

const rpcUrl = process.env.NEXT_PUBLIC_SIDRA_RPC_URL!;
const contractAddress = process.env.NEXT_PUBLIC_SIDRA_CONTRACT_ADDRESS!;
const walletAddress = process.env.NEXT_PUBLIC_SIDRA_WALLET_ADDRESS!;

export default function TokenMonitor() {
  const [name, setName] = useState("");
  const [symbol, setSymbol] = useState("");
  const [decimals, setDecimals] = useState(18);
  const [totalSupply, setTotalSupply] = useState("");
  const [walletBalance, setWalletBalance] = useState("");

  const formatNumber = (value: string | number) => {
    const num = parseFloat(value.toString());
    return new Intl.NumberFormat("en-US", {
      minimumFractionDigits: 0,
      maximumFractionDigits: 4,
    }).format(num);
  };

  useEffect(() => {
    const load = async () => {
      try {
        const provider = new ethers.JsonRpcProvider(rpcUrl);
        const contract = new ethers.Contract(
          contractAddress,
          tokenAbi,
          provider
        );

        const [tokenName, tokenSymbol, tokenDecimals, rawSupply, rawBalance] =
          await Promise.all([
            contract.name(),
            contract.symbol(),
            contract.decimals(),
            contract.totalSupply(),
            contract.balanceOf(walletAddress),
          ]);

        const supply = ethers.formatUnits(rawSupply, tokenDecimals);
        const balance = ethers.formatUnits(rawBalance, tokenDecimals);

        setName(tokenName);
        setSymbol(tokenSymbol);
        setDecimals(tokenDecimals);
        setTotalSupply(formatNumber(supply));
        setWalletBalance(formatNumber(balance));
      } catch (error) {
        console.error("Error loading token info:", error);
      }
    };

    load();
  }, []);

  return (
    <div className="p-6">
      <TokenInfo
        name={name}
        symbol={symbol}
        decimals={decimals}
        totalSupply={totalSupply}
        walletBalance={walletBalance}
      />
      <Tabs defaultValue="transfers" className="w-full">
        <TabsList className="mb-4">
          <TabsTrigger value="transfers">Transfers</TabsTrigger>
          <TabsTrigger value="holders">Holders</TabsTrigger>
          <TabsTrigger value="chart">Chart</TabsTrigger>
        </TabsList>
        <TabsContent value="transfers">
          <TokenTransfers />
        </TabsContent>
        <TabsContent value="holders">
          <TokenHoldersPage />
        </TabsContent>
      </Tabs>
    </div>
  );
}
