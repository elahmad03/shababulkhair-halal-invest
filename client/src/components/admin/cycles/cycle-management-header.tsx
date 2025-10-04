// components/admin/cycles/cycle-management-header.tsx
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";

interface CycleManagementHeaderProps {
  onCreateClick: () => void;
}

export function CycleManagementHeader({ onCreateClick }: CycleManagementHeaderProps) {
  return (
    <div className="flex items-center justify-between">
      <div>
        <h1 className="text-4xl font-bold text-slate-900 tracking-tight">
          Cycle Management
        </h1>
        <p className="text-slate-600 mt-2">
          Manage investment cycles, monitor investors, and distribute profits
        </p>
      </div>
      
      <Button
        onClick={onCreateClick}
        className="bg-gradient-to-r from-emerald-600 to-green-500 text-white shadow-md hover:shadow-lg transition-all duration-200 hover:scale-105"
        size="lg"
      >
        <Plus className="mr-2 h-5 w-5" />
        Create New Cycle
      </Button>
    </div>
  );
}