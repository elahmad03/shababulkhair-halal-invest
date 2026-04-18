"use client";

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { CycleDetails } from "@/lib/types/cycle";
import { VenturesTab } from "./VenturesTab";
import { DistributionTab } from "./DistributionTabs";
import { InvestorsTab } from "./InvestorsTab";

interface CycleTabsProps {
  cycleData: CycleDetails;
}

export function CycleTabs({ cycleData }: CycleTabsProps) {
  return (
    <Tabs defaultValue="investors" className="w-full space-y-6">
      
      {/* Tabs Header */}
      <TabsList
        className="
          grid w-full grid-cols-3 
          bg-muted 
          p-1 
          rounded-xl
        "
      >
        <TabsTrigger
          value="investors"
          className="
            data-[state=active]:bg-background
            data-[state=active]:text-foreground
            data-[state=active]:shadow-sm
            text-muted-foreground
            font-medium
          "
        >
          Investors
        </TabsTrigger>

        <TabsTrigger
          value="ventures"
          className="
            data-[state=active]:bg-background
            data-[state=active]:text-foreground
            data-[state=active]:shadow-sm
            text-muted-foreground
            font-medium
          "
        >
          Business Ventures
        </TabsTrigger>

        <TabsTrigger
          value="distribution"
          className="
            data-[state=active]:bg-background
            data-[state=active]:text-foreground
            data-[state=active]:shadow-sm
            text-muted-foreground
            font-medium
          "
        >
          Profit Distribution
        </TabsTrigger>
      </TabsList>

      {/* Tab Content */}
      <TabsContent value="investors" className="mt-0">
        <InvestorsTab investors={cycleData.investors} />
      </TabsContent>

      <TabsContent value="ventures" className="mt-0">
        <VenturesTab ventures={cycleData.ventures} status={cycleData.status} />
      </TabsContent>

      <TabsContent value="distribution" className="mt-0">
        <DistributionTab cycleData={cycleData} />
      </TabsContent>
    </Tabs>
  );
}