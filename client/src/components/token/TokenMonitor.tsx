'use client';
import { useEffect, useState } from 'react';
import { getTokenTransfersForWallets } from '@/components/token/FetchToken';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { walletAddresses, getWalletName } from './WalletNames';
import { Skeleton } from '@/components/ui/skeleton';

const rpcUrl = process.env.NEXT_PUBLIC_SIDRA_RPC_URL!;
const contractAddress = process.env.NEXT_PUBLIC_SIDRA_CONTRACT_ADDRESS!;
// walletAddresses and getWalletName are now imported from WalletNames.ts

export default function TokenTransfers() {
  const [transfers, setTransfers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const pageSize = 10;
  const totalPages = Math.ceil(transfers.length / pageSize);

  useEffect(() => {
    async function loadTransfers() {
      setLoading(true);
      const data = await getTokenTransfersForWallets({
        rpcUrl,
        contractAddress,
        walletAddresses,
        fromBlock: BigInt(0),
      });
      // Sort by latest first (assuming data has a timestamp or blockNumber property, else reverse)
      setTransfers(Array.isArray(data) ? [...data].reverse() : []);
      setLoading(false);
    }
    loadTransfers();
  }, []);

  const paginated = transfers.slice((page - 1) * pageSize, page * pageSize);

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-6 text-primary">Transfers Monitor</h1>
      {loading ? (
        <div className="space-y-2">
          {[...Array(pageSize)].map((_, i) => (
            <div key={i} className="flex space-x-2">
              <Skeleton className="h-6 w-24" />
              <Skeleton className="h-6 w-40" />
              <Skeleton className="h-6 w-40" />
              <Skeleton className="h-6 w-24" />
              <Skeleton className="h-6 w-32" />
            </div>
          ))}
        </div>
      ) : transfers.length === 0 ? (
        <p className="text-center text-lg text-gray-500 font-medium mt-10">No transfers found.</p>
      ) : (
        <>
          <div className="overflow-x-auto rounded shadow border border-gray-200">
            <Table>
              <TableHeader>
                <TableRow className="bg-gray-100 dark:bg-gray-800 text-base">
                  <TableHead className="font-semibold text-primary">Direction</TableHead>
                  <TableHead className="font-semibold text-primary">From</TableHead>
                  <TableHead className="font-semibold text-primary">To</TableHead>
                  <TableHead className="font-semibold text-primary">Amount</TableHead>
                  <TableHead className="font-semibold text-primary">Tx Hash</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {paginated.map((tx, i) => {
                  const isSender = walletAddresses.map(a => a.toLowerCase()).includes(tx.from.toLowerCase());
                  const isReceiver = walletAddresses.map(a => a.toLowerCase()).includes(tx.to.toLowerCase());
                  let direction = 'Other';
                  if (isSender) direction = 'Send';
                  else if (isReceiver) direction = 'Received';
                  return (
                    <TableRow key={i} className="hover:bg-gray-50 dark:hover:bg-gray-900 transition-colors">
                      <TableCell className="font-medium">{direction}</TableCell>
                      <TableCell className="font-mono text-sm">{getWalletName(tx.from)}</TableCell>
                      <TableCell className="font-mono text-sm">{getWalletName(tx.to)}</TableCell>
                      <TableCell className="text-blue-700 font-semibold">{tx.value}</TableCell>
                      <TableCell>
                        <a href={`https://ledger.sidrachain.com/tx/${tx.txHash}`} target="_blank" className="text-blue-600 underline font-mono text-xs">
                          {tx.txHash.slice(0, 10)}...
                        </a>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </div>
          <div className="flex justify-between items-center mt-4">
            <button
              className="px-3 py-1 rounded bg-gray-200 text-gray-700 font-semibold disabled:opacity-50"
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page === 1}
            >
              Previous
            </button>
            <span className="font-medium text-gray-700">Page {page} of {totalPages}</span>
            <button
              className="px-3 py-1 rounded bg-gray-200 text-gray-700 font-semibold disabled:opacity-50"
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              disabled={page === totalPages}
            >
              Next
            </button>
          </div>
        </>
      )}
    </div>
  );
}