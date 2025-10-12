import React from 'react';

interface TokenInfoProps {
  name: string;
  symbol: string;
  decimals: number;
  totalSupply: string;
  circulatingSupply: string;
  walletBalance: string;
}

function formatAmount(val: string) {
  const n = Number(val);
  if (!Number.isFinite(n)) return val;
  // compact formatting for large blockchain numbers on mobile
  return new Intl.NumberFormat(undefined, { maximumFractionDigits: 2 }).format(n);
}

export default function TokenInfo({ name, symbol, decimals, totalSupply, circulatingSupply, walletBalance }: TokenInfoProps) {
  return (
    <div className="mb-6 p-1 rounded-xl bg-gradient-to-br from-indigo-600 via-teal-400 to-violet-600 shadow-lg">
      <div className="p-4 rounded-lg bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800">
        <header className="flex items-start gap-3 sm:items-center sm:gap-4 flex-col sm:flex-row">
          <div className="flex-shrink-0 w-full sm:w-auto">
            <div className="flex items-center gap-3">
              <div className="h-12 w-12 rounded-full bg-gradient-to-tr from-sky-400 to-indigo-600 flex items-center justify-center text-white font-bold">{symbol?.charAt(0)}</div>
              <div>
                <h1 className="text-lg sm:text-2xl font-extrabold leading-tight text-gray-900 dark:text-white">{name}</h1>
                <div className="text-xs text-gray-600 dark:text-gray-300 mt-0.5">{symbol} • {decimals} decimals</div>
              </div>
            </div>
          </div>
          <div className="w-full sm:w-auto mt-3 sm:mt-0 flex gap-2">
            <span className="inline-flex items-center px-3 py-1 rounded-full bg-gray-100 dark:bg-gray-800 text-sm font-medium text-gray-800 dark:text-gray-200">Blockchain</span>
            <span className="inline-flex items-center px-3 py-1 rounded-full bg-gradient-to-r from-teal-400 to-emerald-500 text-white text-sm font-medium">Brand</span>
          </div>
        </header>

        <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
          <div className="p-3 rounded-md bg-gray-50 dark:bg-gray-800 border border-transparent dark:border-gray-700">
            <div className="text-xs text-gray-500 dark:text-gray-400">Total Supply</div>
            <div className="text-base font-semibold text-gray-900 dark:text-white">{formatAmount(totalSupply)}</div>
          </div>

          <div className="p-3 rounded-md bg-gray-50 dark:bg-gray-800 border border-transparent dark:border-gray-700">
            <div className="text-xs text-gray-500 dark:text-gray-400">Circulating Supply</div>
            <div className="text-base font-semibold text-gray-900 dark:text-white">
              {(() => {
                const circN = Number(circulatingSupply);
                const totalN = Number(totalSupply);
                const hasCirc = Number.isFinite(circN) && !Number.isNaN(circN);
                if (!hasCirc) return '—';
                const formatted = formatAmount(String(circN));
                // show percent when totalSupply is numeric and > 0
                if (Number.isFinite(totalN) && totalN > 0) {
                  const pct = (circN / totalN) * 100;
                  return `${formatted} (${pct < 0.01 ? '<0.01' : pct.toFixed(2)}%)`;
                }
                return formatted;
              })()}
            </div>
          </div>

          <div className="p-3 rounded-md bg-gray-50 dark:bg-gray-800 border border-transparent dark:border-gray-700">
            <div className="text-xs text-gray-500 dark:text-gray-400">Wallet Balance</div>
            <div className="text-base font-semibold text-gray-900 dark:text-white">{formatAmount(walletBalance)} {symbol}</div>
          </div>

          <div className="p-3 rounded-md bg-gray-50 dark:bg-gray-800 border border-transparent dark:border-gray-700">
            <div className="text-xs text-gray-500 dark:text-gray-400">Decimals</div>
            <div className="text-base font-semibold text-gray-900 dark:text-white">{decimals}</div>
          </div>
        </div>
      </div>
    </div>
  );
}