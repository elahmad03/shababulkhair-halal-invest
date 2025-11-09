// components/admin/cycle-tabs.tsx
"use client"

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { CycleDetails } from "@/lib/types/cycle"
import { VenturesTab } from "./VenturesTab"
import { DistributionTab } from "./DistributionTabs"
import { InvestorsTab } from "./InvestorsTab"

interface CycleTabsProps {
  cycleData: CycleDetails
}

export function CycleTabs({ cycleData }: CycleTabsProps) {
  return (
    <Tabs defaultValue="investors" className="w-full">
      <TabsList className="grid w-full grid-cols-3">
        <TabsTrigger value="investors">Investors</TabsTrigger>
        <TabsTrigger value="ventures">Business Ventures</TabsTrigger>
        <TabsTrigger value="distribution">Profit Distribution</TabsTrigger>
      </TabsList>

      <TabsContent value="investors">
        <InvestorsTab investors={cycleData.investors} />
      </TabsContent>

      <TabsContent value="ventures">
        <VenturesTab ventures={cycleData.ventures} status={cycleData.status} />
      </TabsContent>

      <TabsContent value="distribution">
        <DistributionTab cycleData={cycleData} />
      </TabsContent>
    </Tabs>
  )
}