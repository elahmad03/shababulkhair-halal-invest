'use client';

import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

import { OpenCyclesTab } from './open-cycle-tab';
import { ActiveCyclesTab } from './active-cycle-tab';
import { HistoryTab } from './history-tab';

export function InvestmentCyclesPage() {
  return (
    <div className="container mx-auto py-8 px-4">
      <h1 className="text-3xl font-bold mb-6">Investment Cycles</h1>

      <Tabs defaultValue="open" className="w-full">
        <TabsList className="grid w-full grid-cols-3 mb-8">
          <TabsTrigger value="open">Open for Investment</TabsTrigger>
          <TabsTrigger value="active">My Active Cycles</TabsTrigger>
          <TabsTrigger value="history">Investment History</TabsTrigger>
        </TabsList>

        <TabsContent value="open">
          <OpenCyclesTab />
        </TabsContent>

        <TabsContent value="active">
          <ActiveCyclesTab />
        </TabsContent>

        <TabsContent value="history">
          <HistoryTab />
        </TabsContent>
      </Tabs>
    </div>
  );
}