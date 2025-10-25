"use client";

import { useState, useEffect } from "react";
import { mockData } from "@/db/mockData";
import { User, WithdrawalRequest } from "@/schemas/app";
import HeaderBox from "@/components/common/HeaderBox";
import { AdminWithdrawalList } from "@/components/admin/withdrawals/WthdrawalList";
import { AdminWithdrawalTable } from "@/components/admin/withdrawals/WithdrawalsTable";

// Define an enriched type for our component data
export type PendingWithdrawal = WithdrawalRequest & { user: Pick<User, 'fullName' | 'email'> };

// A simple hook to detect screen size for responsive rendering
const useMediaQuery = (query: string) => {
  const [matches, setMatches] = useState(false);
  useEffect(() => {
    const media = window.matchMedia(query);
    if (media.matches !== matches) {
      setMatches(media.matches);
    }
    const listener = () => setMatches(media.matches);
    window.addEventListener("resize", listener);
    return () => window.removeEventListener("resize", listener);
  }, [matches, query]);
  return matches;
};

// Helper to fetch and combine data
const getPendingWithdrawals = (): PendingWithdrawal[] => {
  const pending = mockData.withdrawalRequests.filter(
    (req) => req.status === "pending"
  );

  return pending.map((req) => {
    const user = mockData.users.find((u) => u.id === req.userId);
    return {
      ...req,
      user: {
        fullName: user?.fullName || "Unknown User",
        email: user?.email || "No email",
      },
    };
  });
};

export default function AdminPendingWithdrawalsPage() {
  const pendingWithdrawals = getPendingWithdrawals();
  const isDesktop = useMediaQuery("(min-width: 768px)");

  // A handler function to optimistically update the UI after an action
  const handleAction = (requestId: number) => {
    // In a real app, you would re-fetch data or update the state
    console.log(`Action taken on request ${requestId}. Refreshing list...`);
    // For this mock, we'll just log it. A real implementation would filter the list.
  };

  return (
    <section className="flex flex-col gap-8 p-4 md:p-6">
      <HeaderBox
        title="Pending Withdrawals"
        subtext={`Review and process all outstanding withdrawal requests. There are ${pendingWithdrawals.length} pending requests.`}
      />
      
      <div className="w-full">
        {isDesktop ? (
          <AdminWithdrawalTable data={pendingWithdrawals} onAction={handleAction} />
        ) : (
          <AdminWithdrawalList data={pendingWithdrawals} onAction={handleAction} />
        )}
      </div>
    </section>
  );
}