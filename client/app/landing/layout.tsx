// app/landing/layout.tsx
import type { ReactNode } from 'react';
import Header from './components/header';
import Footer from './components/footer';

export default function LandingLayout({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1">{children}</main>
      <Footer />
    </div>
  );
}
