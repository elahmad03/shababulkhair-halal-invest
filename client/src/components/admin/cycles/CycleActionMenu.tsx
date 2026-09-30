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
  Play,
  CheckCircle,
  TrendingUp,
  FileText,
  AlertCircle,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import type { CycleWithStats } from "./Columns";
import { useUpdateCycleStatusMutation } from "@/store/modules/cycle/cycleApi";

interface CycleActionsDropdownProps {
  cycle: CycleWithStats;
}

export function CycleActionsDropdown({ cycle }: CycleActionsDropdownProps) {
  const router = useRouter();

  const [showActivateDialog, setShowActivateDialog] = useState(false);
  const [showCloseWindowDialog, setShowCloseWindowDialog] = useState(false);

  const [updateCycleStatus, { isLoading: isUpdating }] = useUpdateCycleStatusMutation();

  const status = cycle.status.toUpperCase();

  // ─────────────────────────────────────────────
  // Action Handlers
  // ─────────────────────────────────────────────

  const handleOpenForInvestment = async () => {
    try {
      await updateCycleStatus({
        cycleId: cycle.id,
        body: { status: "OPEN_FOR_INVESTMENT" },
      }).unwrap();
      toast.success("Cycle is now open for investment");
    } catch (err: any) {
      toast.error(err?.data?.message || "Failed to open cycle");
    }
  };

  const handleMakeActive = async () => {
    try {
      await updateCycleStatus({
        cycleId: cycle.id,
        body: { status: "ACTIVE" },
      }).unwrap();
      toast.success("Cycle activated — investment window closed");
      setShowActivateDialog(false);
    } catch (err: any) {
      toast.error(err?.data?.message || "Failed to activate cycle");
    }
  };

  const handleMoveToClosing = async () => {
    try {
      await updateCycleStatus({
        cycleId: cycle.id,
        body: { status: "CLOSING" },
      }).unwrap();
      toast.success("Cycle moved to Closing — disbursement window open");
      setShowCloseWindowDialog(false);
    } catch (err: any) {
      toast.error(err?.data?.message || "Failed to close cycle investment window");
    }
  };

  const handleViewDetails = () => {
    router.push(`/admin/cycles/${cycle.id}`);
  };

  // ─────────────────────────────────────────────
  // Render by Status
  // ─────────────────────────────────────────────

  if (status === "PENDING") {
    return (
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" size="icon" disabled={isUpdating}>
            <MoreHorizontal className="h-4 w-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuItem onClick={handleOpenForInvestment}>
            <CheckCircle className="mr-2 h-4 w-4 text-emerald-600" />
            Open for Investment
          </DropdownMenuItem>
          <DropdownMenuItem onClick={handleViewDetails}>
            <Eye className="mr-2 h-4 w-4" />
            View Details
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    );
  }

  if (status === "OPEN_FOR_INVESTMENT") {
    return (
      <>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" disabled={isUpdating}>
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={() => setShowActivateDialog(true)}>
              <Play className="mr-2 h-4 w-4 text-blue-600" />
              Activate Cycle
            </DropdownMenuItem>
            <DropdownMenuItem onClick={handleViewDetails}>
              <Eye className="mr-2 h-4 w-4" />
              View Details
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>

        <AlertDialog open={showActivateDialog} onOpenChange={setShowActivateDialog}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Activate Investment Cycle?</AlertDialogTitle>
              <AlertDialogDescription>
                This will close the share purchase window for "{cycle.name}" and stamp
                the start date. No further share purchases will be allowed.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction onClick={handleMakeActive} className="bg-blue-600">
                Activate Cycle
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </>
    );
  }

  if (status === "ACTIVE") {
    return (
      <>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" disabled={isUpdating}>
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={handleViewDetails}>
              <Eye className="mr-2 h-4 w-4" />
              View Details
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={() => setShowCloseWindowDialog(true)}>
              <AlertCircle className="mr-2 h-4 w-4 text-amber-600" />
              Open Closing Window
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>

        <AlertDialog open={showCloseWindowDialog} onOpenChange={setShowCloseWindowDialog}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Move to Closing Window?</AlertDialogTitle>
              <AlertDialogDescription>
                This will transition "{cycle.name}" to CLOSING status, notifying members to
                declare their withdrawal/disbursement preferences before profit distribution.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction onClick={handleMoveToClosing} className="bg-amber-600">
                Move to Closing
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </>
    );
  }

  if (status === "CLOSING") {
    return (
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" size="icon">
            <MoreHorizontal className="h-4 w-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuItem onClick={handleViewDetails}>
            <TrendingUp className="mr-2 h-4 w-4 text-green-600" />
            Distribute Profits & Complete
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
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
        <DropdownMenuItem onClick={handleViewDetails}>
          <FileText className="mr-2 h-4 w-4" />
          View Report
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}