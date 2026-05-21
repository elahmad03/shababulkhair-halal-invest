"use client";

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { CycleDetails } from "@/lib/types/cycle";
import { VenturesTab } from "./VenturesTab";
import { DistributionTab } from "./DistributionTabs";
import { InvestorsTab } from "./InvestorsTab";
import { Users, Briefcase, TrendingUp } from "lucide-react";

interface CycleTabsProps {
  cycleData: CycleDetails;
}

export function CycleTabs({ cycleData }: CycleTabsProps) {
  return (
    <Tabs defaultValue="investors" className="w-full space-y-6">
      
      {/* Tabs Header with semantic styling */}
      <TabsList
        className="
          grid w-full grid-cols-3 
          bg-slate-100 
          p-1 
          rounded-lg
          border border-slate-200
        "
      >
        <TabsTrigger
          value="investors"
          className="
            data-[state=active]:bg-white
            data-[state=active]:text-slate-900
            data-[state=active]:shadow-sm
            data-[state=active]:border-b-2
            data-[state=active]:border-blue-500
            text-slate-600
            font-medium
            gap-2
          "
        >
          <Users className="h-4 w-4" />
          Investors
          <span className="ml-1 px-2 py-0.5 rounded-full bg-blue-50 text-blue-600 text-xs font-semibold">
            {cycleData.numberOfInvestors}
          </span>
        </TabsTrigger>

        <TabsTrigger
          value="ventures"
          className="
            data-[state=active]:bg-white
            data-[state=active]:text-slate-900
            data-[state=active]:shadow-sm
            data-[state=active]:border-b-2
            data-[state=active]:border-amber-500
            text-slate-600
            font-medium
            gap-2
          "
        >
          <Briefcase className="h-4 w-4" />
          Ventures
          <span className="ml-1 px-2 py-0.5 rounded-full bg-amber-50 text-amber-600 text-xs font-semibold">
            {cycleData.ventureCount}
          </span>
        </TabsTrigger>

        <TabsTrigger
          value="distribution"
          className="
            data-[state=active]:bg-white
            data-[state=active]:text-slate-900
            data-[state=active]:shadow-sm
            data-[state=active]:border-b-2
            data-[state=active]:border-green-500
            text-slate-600
            font-medium
            gap-2
          "
        >
          <TrendingUp className="h-4 w-4" />
          Profit
        </TabsTrigger>
      </TabsList>

      {/* Tab Content */}
      <TabsContent value="investors" className="mt-6 space-y-4">
        <InvestorsTab investors={cycleData.investors} />
      </TabsContent>

      <TabsContent value="ventures" className="mt-6 space-y-4">
        <VenturesTab ventures={cycleData.ventures} status={cycleData.status} />
      </TabsContent>

      <TabsContent value="distribution" className="mt-6 space-y-4">
        <DistributionTab cycleData={cycleData} />
      </TabsContent>
    </Tabs>
  );
}