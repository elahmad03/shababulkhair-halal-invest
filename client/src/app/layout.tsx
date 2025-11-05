import type { Metadata } from "next";
import StoreProvider from "@/store/storeProvider";
import { Toaster } from "sonner";

import localFont from 'next/font/local';
import './globals.css';

const IBMPlexSerif = localFont({
  src: '../../public/fonts/IBMPlexSerif-Regular.ttf',
  display: 'swap',
});

// import { Inter } from "next/font/google";
// const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Shababulkhair Halal Investment Ltd ",
  description: "no 1 fintech for sharia compliant",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={IBMPlexSerif.className}>
        <StoreProvider> {children}</StoreProvider>
        <Toaster />
      </body>
    </html>
  );
}
