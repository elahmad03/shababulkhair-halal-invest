import type { Metadata } from "next";
import StoreProvider from "@/store/storeProvider";
import { Toaster } from "sonner";

import localFont from "next/font/local";
import "./globals.css";
import { ThemeProvider } from "@/components/theme-provider";

const IBMPlexSerif = localFont({
  src: "../../public/fonts/IBMPlexSerif-Regular.ttf",
  display: "swap",
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
    <html lang="en" suppressHydrationWarning>
      <body className={IBMPlexSerif.className}>
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <StoreProvider> {children}</StoreProvider>
        </ThemeProvider>
        <Toaster />
      </body>
    </html>
  );
}
