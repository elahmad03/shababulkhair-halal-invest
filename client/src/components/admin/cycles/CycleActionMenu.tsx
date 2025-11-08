"use client";

import { useState } from "react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import {
  MoreVertical,
  Play,
  Edit,
  Trash2,
  CheckCircle,
  Users,
  DollarSign,
  FileText,
} from "lucide-react";
import { DistributeProfitDialog } from "./DistributeProfit";

interface Cycle {
  id: string;
  name: string;
  status: "pending" | "open" | "active" | "completed";
  totalInvested: number;
  investors: number;
  startDate: string;
  endDate: string;
}

interface CycleActionsMenuProps {
  cycle: Cycle;
}

export function CycleActionsMenu({ cycle }: CycleActionsMenuProps) {
  const [isDistributeProfitOpen, setIsDistributeProfitOpen] = useState(false);

  const handleAction = (action: string) => {
    console.log(`Action: ${action} for cycle:`, cycle.id);
    // TODO: Implement actual actions
  };

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" size="icon" className="h-8 w-8">
            <MoreVertical className="h-4 w-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-56">
          {cycle.status === "pending" && (
            <>
              <DropdownMenuItem onClick={() => handleAction("open")}>
                <Play className="mr-2 h-4 w-4" />
                Open for Investment
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => handleAction("edit")}>
                <Edit className="mr-2 h-4 w-4" />
                Edit
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                onClick={() => handleAction("delete")}
                className="text-red-600"
              >
                <Trash2 className="mr-2 h-4 w-4" />
                Delete
              </DropdownMenuItem>
            </>
          )}

          {cycle.status === "open" && (
            <>
              <DropdownMenuItem onClick={() => handleAction("make-active")}>
                <CheckCircle className="mr-2 h-4 w-4" />
                Make Active
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => handleAction("view-investors")}>
                <Users className="mr-2 h-4 w-4" />
                View Investors
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => handleAction("edit")}>
                <Edit className="mr-2 h-4 w-4" />
                Edit
              </DropdownMenuItem>
            </>
          )}

          {cycle.status === "active" && (
            <>
              <DropdownMenuItem
                onClick={() => setIsDistributeProfitOpen(true)}
                className="text-green-600 font-medium"
              >
                <DollarSign className="mr-2 h-4 w-4" />
                Close & Distribute Profit
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => handleAction("view-investors")}>
                <Users className="mr-2 h-4 w-4" />
                View Investors
              </DropdownMenuItem>
            </>
          )}

          {cycle.status === "completed" && (
            <DropdownMenuItem onClick={() => handleAction("view-report")}>
              <FileText className="mr-2 h-4 w-4" />
              View Report
            </DropdownMenuItem>
          )}
        </DropdownMenuContent>
      </DropdownMenu>

      <DistributeProfitDialog
        open={isDistributeProfitOpen}
        onOpenChange={setIsDistributeProfitOpen}
        cycle={cycle}
      />
    </>
  );
}