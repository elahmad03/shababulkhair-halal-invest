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

export default function TokenPage() {
  const [name, setName] = useState("");
  const [symbol, setSymbol] = useState("");
  const [decimals, setDecimals] = useState(18);
  // formatted states (for other UI) and raw numeric states (for TokenInfo calculations)
  const [totalSupply, setTotalSupply] = useState("");
  const [rawTotalSupply, setRawTotalSupply] = useState("");
  const [circulatingSupply, setCirculatingSupply] = useState("");
  const [rawCirculatingSupply, setRawCirculatingSupply] = useState("");
  const [walletBalance, setWalletBalance] = useState("");
  const [rawWalletBalance, setRawWalletBalance] = useState("");
  const [detectedLPs, setDetectedLPs] = useState<string[]>([]);
  const [excludeLPs, setExcludeLPs] = useState(false);

  const formatNumber = (value: string | number) => {
    const num = parseFloat(value.toString());
    return new Intl.NumberFormat("en-US", {
      minimumFractionDigits: 0,
      maximumFractionDigits: 4,
    }).format(num);
  };

  // addresses to exclude from circulating supply (treasury/locked/owner)
  const excludeAddrs = [
    "0x986475ABD92928468103B20C52610B4Dd09B8E79",
    "0x01e9E3977bbb1980A8b5AA2d360711B7b110b7ED",
    "0x7A12382Ca9410ee3050590556FAc8416654aA195",
    "0x4bd3efCd0b2D7C365f2ADfF27EF5df72fbc08087"
  ];

  // DEX factory addresses (Uniswap V2 style)
  const DEX_FACTORIES = [
    { name: "UniswapV2", address: "0x5C69bEe701ef814a2B6a3EDD4B1652CB9cc5aA6f" },
    { name: "SushiSwap", address: "0xC0AEe478e3658e2610c5F7A4A2E1777Ce9e4f2Ac" },
  ];

  const load = async () => {
    try {
      const provider = new ethers.JsonRpcProvider(rpcUrl);
      const contract = new ethers.Contract(contractAddress, tokenAbi, provider);

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

      // try to auto-detect LP pairs using common factory contracts
      const factoryAbi = ["function getPair(address,address) view returns (address)"];
      const weth = process.env.NEXT_PUBLIC_WETH_ADDRESS || "0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2";
      const foundLPs: string[] = [];
      for (const f of DEX_FACTORIES) {
        try {
          const fac = new ethers.Contract(f.address, factoryAbi, provider);
          const pair = await fac.getPair(contractAddress, weth);
          const ZERO = "0x0000000000000000000000000000000000000000";
          if (pair && pair !== ZERO) foundLPs.push(pair);
        } catch (err) {
          // ignore per-factory errors
        }
      }
      setDetectedLPs(foundLPs);

      // build active exclude list (base excludes + optionally detected LPs)
      const activeExcludes = excludeLPs ? [...excludeAddrs, ...foundLPs] : [...excludeAddrs];

      // fetch excluded balances and subtract from raw supply to compute circulating
      let circulatingRawBigInt = BigInt(rawSupply.toString());
      try {
        const excludedRawBalances: any[] = await Promise.all(
          activeExcludes.map((a: string) => contract.balanceOf(a))
        );
        const excludedSum = excludedRawBalances.reduce((acc: bigint, b: any) => acc + BigInt(b.toString()), 0n);
        if (excludedSum > 0n) {
          if (excludedSum >= circulatingRawBigInt) {
            circulatingRawBigInt = 0n;
          } else {
            circulatingRawBigInt = circulatingRawBigInt - excludedSum;
          }
        }
      } catch (err) {
        console.warn("Error fetching excluded balances, using total supply for circulating:", err);
      }

      const circulating = ethers.formatUnits(circulatingRawBigInt, tokenDecimals);

      // store raw numeric strings (no commas) for internal calculation/display
      setRawTotalSupply(String(supply));
      setRawCirculatingSupply(String(circulating));
      setRawWalletBalance(String(balance));

      // store formatted values for other UI
      setTotalSupply(formatNumber(supply));
      setCirculatingSupply(formatNumber(circulating));
      setWalletBalance(formatNumber(balance));
    } catch (error) {
      console.error("Error loading token info:", error);
    }
  };

  useEffect(() => {
    load();
    // re-run when toggle changes so exclusion set updates
    }, [excludeLPs]);

  return (
    <div className="p-6">
      <TokenInfo
        name={name}
        symbol={symbol}
        decimals={decimals}
        totalSupply={rawTotalSupply || totalSupply}
        circulatingSupply={rawCirculatingSupply || circulatingSupply}
        walletBalance={rawWalletBalance || walletBalance}
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
  
    return (
      <div>
        {/* Token page — minimal render to close the component */}
      </div>
    );
  }
