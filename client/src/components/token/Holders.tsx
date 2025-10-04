'use client';

import {
  useGetTokenHoldersQuery,
  useGetCountersQuery,
} from '@/store/tokenApi';
import {
  Tabs,
  TabsList,
  TabsTrigger,
  TabsContent,
} from '@/components/ui/tabs';
import { Card, CardContent } from '@/components/ui/card';
import { Loader2 } from 'lucide-react';
import clsx from 'clsx';
import { useState } from 'react';

const contractAddress = process.env.NEXT_PUBLIC_SIDRA_CONTRACT_ADDRESS!;

const teamWallets = new Set(
  [
    '0x9948c0D4b2f8eED11215986a0d8884656ea7BF76',
    '0x6Ef31a97bd458A3102bebF10a5424210d8a10C4B',
    '0x2a6b904806Cd4FB3FB3AD5957d4A1f9141f9b7c1',
    '0x3553BF8299748C6661e0B0Ac4807FeF6822a1507',
    '0x5e1C7a84feC900eD0d8E9CE8304a53f9Fa4C1E9D',
    '0xd49e5FC5994f9B55294C0b60118f5bc2f73fD507',
    '0xBF8B0DB07763B411D9C62ff210B914DA097Cc9F6',
    '0x3aa6C532aF817c1BE7B419718363bdd962f237d1',
    '0x3C628b76C718eCc056dbBE2a884075B7334cb9ca',
    '0xf5E867Bfc53E553b928343644b5d7099C6eA66AC',
    '0xADb349CE0410faC56E7Ab4F010e023989cBDA90A',
    '0xfb9eb148718A39dca4eedffAc2eD61b52480f9B1',
    '0x7A6Ec2430e75EEE845B3c5eFA1367C6784226aF6',
  ].map((addr) => addr.toLowerCase())
);

function formatBalance(balance: string, decimals = 18) {
  const num = parseFloat(balance);
  if (isNaN(num)) return '0';
  return (num / Math.pow(10, decimals)).toLocaleString(undefined, {
    minimumFractionDigits: 2,
    maximumFractionDigits: 4,
  });
}

export default function TokenHoldersPage() {
  const { data: holdersData, error, isLoading } =
    useGetTokenHoldersQuery(contractAddress);
  const {
    data: countersData,
    isLoading: countersLoading,
  } = useGetCountersQuery(contractAddress);
  const [tab, setTab] = useState('all');

  if (isLoading || countersLoading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <Loader2 className="animate-spin w-6 h-6 text-muted-foreground" />
      </div>
    );
  }

  if (error || !holdersData || !Array.isArray(holdersData.items)) {
    return (
      <p className="text-center text-red-500 mt-10">
        Failed to load token holders.
      </p>
    );
  }

  const allHolders = holdersData.items;

  const teamOnly = allHolders.filter((holder: any) =>
    teamWallets.has(holder.address.hash.toLowerCase())
  );

  const whalesOnly = allHolders.filter((holder: any) => {
    const balance = parseFloat(holder.value) / Math.pow(10, 18);
    return balance >= 1000;
  });

  return (
    <div className="p-4 max-w-3xl mx-auto space-y-6">
      <div className="space-y-1">
        <h2 className="text-2xl font-semibold">Token Holders</h2>
        {countersData && (
          <div className="text-sm text-muted-foreground space-x-4">
            <span>
              <strong>{countersData.token_holders_count}</strong> holders
            </span>
            <span>
              <strong>{countersData.transfers_count}</strong> transfers
            </span>
          </div>
        )}
      </div>

      <Tabs defaultValue="all" onValueChange={setTab} className="w-full">
        <TabsList className="bg-gray-100 dark:bg-gray-800">
          <TabsTrigger value="all">All</TabsTrigger>
          <TabsTrigger value="team">Team</TabsTrigger>
          <TabsTrigger value="whales">Whales</TabsTrigger>
        </TabsList>

        <TabsContent value="all">
          <HoldersList holders={allHolders} />
        </TabsContent>

        <TabsContent value="team">
          {teamOnly.length === 0 ? (
            <p className="text-muted-foreground text-sm mt-4 text-center">
              No team members found in current holders.
            </p>
          ) : (
            <HoldersList holders={teamOnly} />
          )}
        </TabsContent>

        <TabsContent value="whales">
          {whalesOnly.length === 0 ? (
            <p className="text-muted-foreground text-sm mt-4 text-center">
              No whales found (10,000+ tokens).
            </p>
          ) : (
            <HoldersList holders={whalesOnly} isWhaleList />
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}

function HoldersList({
  holders,
  isWhaleList = false,
}: {
  holders: any[];
  isWhaleList?: boolean;
}) {
  return (
    <div className="space-y-4 mt-4">
      {holders.map((holder, index) => {
        const address = holder.address.hash.toLowerCase();
        const isTeam = teamWallets.has(address);
        const balance = parseFloat(holder.value) / Math.pow(10, 18);
        const isWhale = balance >= 10000;

        return (
          <Card
            key={index}
            className={clsx(
              'transition-all border shadow-sm',
              isTeam
                ? 'border-green-600 bg-green-50 dark:bg-green-900/20'
                : isWhale
                ? 'border-blue-600 bg-blue-50 dark:bg-blue-900/20'
                : 'border-gray-300 dark:border-gray-700'
            )}
          >
            <CardContent className="p-4 space-y-1 text-sm">
              <p className="break-all font-medium">
                <span className="font-medium">Address:</span>{' '}
                {holder.address.hash}
                {isTeam && (
                  <span className="ml-2 bg-green-100 text-green-800 dark:bg-green-800 dark:text-green-100 px-2 py-0.5 rounded text-xs">
                    Team
                  </span>
                )}
                {isWhale && (
                  <span className="ml-2 bg-blue-100 text-blue-800 dark:bg-blue-800 dark:text-blue-100 px-2 py-0.5 rounded text-xs">
                    Whale
                  </span>
                )}
              </p>
              <p>
                <span className="font-medium">Balance:</span>{' '}
                {formatBalance(holder.value)} tokens
              </p>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}