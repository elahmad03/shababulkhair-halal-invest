"use client";

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
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
      <TabsList className="grid w-full grid-cols-3">
        <TabsTrigger value="investors" className="gap-2">
          <Users className="h-4 w-4" />
          <span>Investors</span>
          <Badge variant="secondary" className="ml-1 text-xs px-1.5 py-0">
            {cycleData.numberOfInvestors}
          </Badge>
        </TabsTrigger>

        <TabsTrigger value="ventures" className="gap-2">
          <Briefcase className="h-4 w-4" />
          <span>Ventures</span>
          <Badge variant="secondary" className="ml-1 text-xs px-1.5 py-0">
            {cycleData.ventureCount}
          </Badge>
        </TabsTrigger>

        <TabsTrigger value="distribution" className="gap-2">
          <TrendingUp className="h-4 w-4" />
          <span>Profit Distribution</span>
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
