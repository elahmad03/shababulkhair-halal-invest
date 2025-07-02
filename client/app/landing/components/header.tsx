'use client';
import Link from 'next/link';

export default function Header() {
  return (
    <header className="w-full border-b shadow-sm bg-white dark:bg-zinc-900">
      <div className="max-w-7xl mx-auto px-4 py-3 flex justify-between items-center">
        <h1 className="text-xl font-bold">Shabaulkhair</h1>
        <nav className="space-x-4">
          <Link href="/landing">Home</Link>
          <Link href="/investment">Invest</Link>
          <Link href="/market">Marketplace</Link>
          <Link href="/wallet">Wallet</Link>
          <Link href="/login">Login</Link>
        </nav>
      </div>
    </header>
  );
}
