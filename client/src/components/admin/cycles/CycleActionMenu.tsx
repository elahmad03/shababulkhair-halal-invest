"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  MoreHorizontal,
  Eye,
  Edit,
  Trash2,
  Play,
  DollarSign,
  FileText,
  CheckCircle,
} from "lucide-react";
import { useRouter } from "next/navigation";

import type { CycleWithStats } from "./Columns";

// ✅ RTK hooks
import {
  useOpenCycleMutation,
  useActivateCycleMutation,
  useCompleteCycleMutation,
} from "@/store/modules/cycle/cycleApi";

interface CycleActionsDropdownProps {
  cycle: CycleWithStats;
}

export function CycleActionsDropdown({ cycle }: CycleActionsDropdownProps) {
  const router = useRouter();

  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [showDistributeDialog, setShowDistributeDialog] = useState(false);

  const [openCycle, { isLoading: opening }] = useOpenCycleMutation();
  const [activateCycle, { isLoading: activating }] = useActivateCycleMutation();
  const [completeCycle, { isLoading: completing }] = useCompleteCycleMutation();

  // ─────────────────────────────────────────────
  // Actions
  // ─────────────────────────────────────────────

  const handleOpenForInvestment = async () => {
    await openCycle(cycle.id);
  };

  const handleMakeActive = async () => {
    await activateCycle(cycle.id);
  };

  const handleDistributeProfit = async () => {
    await completeCycle({
      cycleId: cycle.id,
      body: { investorProfitPercent: 80 }, // adjust if needed
    });
    setShowDistributeDialog(false);
  };

  const handleViewDetails = () => {
    router.push(`/cycles/${cycle.id}`);
  };

  const handleEdit = () => {
    router.push(`/cycles/${cycle.id}/edit`);
  };

  const handleViewReport = () => {
    router.push(`/cycles/${cycle.id}`);
  };

  // ─────────────────────────────────────────────
  // STATUS SWITCH (normalized)
  // ─────────────────────────────────────────────

  if (cycle.status === "PENDING") {
    return (
      <>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" disabled={opening}>
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>

          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={handleOpenForInvestment}>
              <CheckCircle className="mr-2 h-4 w-4" />
              Open for Investment
            </DropdownMenuItem>

            <DropdownMenuItem onClick={handleEdit}>
              <Edit className="mr-2 h-4 w-4" />
              Edit
            </DropdownMenuItem>

            <DropdownMenuSeparator />

            <DropdownMenuItem
              onClick={() => setShowDeleteDialog(true)}
              className="text-destructive"
            >
              <Trash2 className="mr-2 h-4 w-4" />
              Delete
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>

        {/* Delete Dialog */}
        <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Delete Cycle</AlertDialogTitle>
              <AlertDialogDescription>
                Are you sure you want to delete "{cycle.name}"?
              </AlertDialogDescription>
            </AlertDialogHeader>

            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction className="bg-destructive">
                Delete
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </>
    );
  }

  if (cycle.status === "OPEN_FOR_INVESTMENT") {
    return (
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" size="icon" disabled={activating}>
            <MoreHorizontal className="h-4 w-4" />
          </Button>
        </DropdownMenuTrigger>

        <DropdownMenuContent align="end">
          <DropdownMenuItem onClick={handleMakeActive}>
            <Play className="mr-2 h-4 w-4" />
            Make Active
          </DropdownMenuItem>

          <DropdownMenuItem onClick={handleViewDetails}>
            <Eye className="mr-2 h-4 w-4" />
            View Details
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    );
  }

  if (cycle.status === "ACTIVE") {
    return (
      <>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" disabled={completing}>
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>

          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={handleViewDetails}>
              <Eye className="mr-2 h-4 w-4" />
              View Details
            </DropdownMenuItem>

            <DropdownMenuSeparator />

            <DropdownMenuItem onClick={() => setShowDistributeDialog(true)}>
              <DollarSign className="mr-2 h-4 w-4" />
              Close & Distribute Profit
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>

        {/* Distribute Dialog */}
        <AlertDialog
          open={showDistributeDialog}
          onOpenChange={setShowDistributeDialog}
        >
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>
                Close Cycle & Distribute Profit
              </AlertDialogTitle>

              <AlertDialogDescription>
                This will close "{cycle.name}" and distribute profits.
              </AlertDialogDescription>
            </AlertDialogHeader>

            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction onClick={handleDistributeProfit}>
                Confirm & Distribute
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </>
    );
  }

  // COMPLETED
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon">
          <MoreHorizontal className="h-4 w-4" />
        </Button>
      </DropdownMenuTrigger>

      <DropdownMenuContent align="end">
        <DropdownMenuItem onClick={handleViewReport}>
          <FileText className="mr-2 h-4 w-4" />
          View Report
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}