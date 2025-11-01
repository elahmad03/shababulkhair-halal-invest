// app/admin/cycles/page.tsx
"use client";

import { useState } from "react";
import { CycleManagementHeader } from "@/components/admin/cycles/cycle-management-header";
import { CyclesDataTable } from "@/components/admin/cycles/CycleDataTable";
import { CreateCycleDialog } from "@/components/admin/cycles/CreateCycleDiaglog";

export default function CycleManagementPage() {
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);

  return (
    
      <div className="container px-4 py-8 max-w-7xl">
        <CycleManagementHeader onCreateClick={() => setIsCreateDialogOpen(true)} />
        
        <div className="mt-8">
          <CyclesDataTable />
        </div>

        <CreateCycleDialog 
          open={isCreateDialogOpen} 
          onOpenChange={setIsCreateDialogOpen} 
        />
      </div>
  
  );
}