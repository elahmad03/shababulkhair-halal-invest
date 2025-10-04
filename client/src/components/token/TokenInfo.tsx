import React from 'react';

interface TokenInfoProps {
  name: string;
  symbol: string;
  decimals: number;
  totalSupply: string;
  walletBalance: string;
}

export default function TokenInfo({ name, symbol, decimals, totalSupply, walletBalance }: TokenInfoProps) {
  return (
    <div className="mb-6 p-4 rounded shadow bg-white dark:bg-gray-900 border border-gray-200">
      <h1 className="text-2xl font-bold mb-2 text-primary">{name}</h1>
      <div className="flex flex-wrap gap-4 text-base">
        <div><span className="font-semibold">Symbol:</span> {symbol}</div>
        <div><span className="font-semibold">Decimals:</span> {decimals}</div>
        <div><span className="font-semibold">Total Supply:</span> {totalSupply}</div>
        <div><span className="font-semibold">Wallet Balance:</span> {walletBalance} {symbol}</div>
      </div>
    </div>
  );
}