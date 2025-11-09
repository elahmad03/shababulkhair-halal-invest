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
import type { InvestmentCycle } from "@/db/types";
import { useRouter } from "next/navigation";

interface CycleActionsDropdownProps {
  cycle: InvestmentCycle;
}

export function CycleActionsDropdown({ cycle }: CycleActionsDropdownProps) {
  const router = useRouter();
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [showDistributeDialog, setShowDistributeDialog] = useState(false);

  const handleOpenForInvestment = () => {
    // TODO: Implement API call
    console.log("Opening cycle for investment:", cycle.id);
  };

  const handleMakeActive = () => {
    // TODO: Implement API call
    console.log("Making cycle active:", cycle.id);
  };

  const handleDistributeProfit = () => {
    // TODO: Implement API call
    console.log("Distributing profit for cycle:", cycle.id);
    setShowDistributeDialog(false);
  };

  const handleDelete = () => {
    // TODO: Implement API call
    console.log("Deleting cycle:", cycle.id);
    setShowDeleteDialog(false);
  };

  const handleViewDetails = () => {
    router.push(`cycles/${cycle.id}`);
  };

  const handleEdit = () => {
    router.push(`cycles/${cycle.id}/edit`);
  };

  const handleViewReport = () => {
    router.push(`cycles/${cycle.id}`);
  };

  // Pending cycle actions
  if (cycle.status === "pending") {
    return (
      <>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon">
              <MoreHorizontal className="h-4 w-4" />
              <span className="sr-only">Open menu</span>
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

        <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Delete Cycle</AlertDialogTitle>
              <AlertDialogDescription>
                Are you sure you want to delete "{cycle.name}"? This action cannot
                be undone.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction onClick={handleDelete} className="bg-destructive">
                Delete
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </>
    );
  }

  // Open for investment cycle actions
  if (cycle.status === "open_for_investment") {
    return (
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" size="icon">
            <MoreHorizontal className="h-4 w-4" />
            <span className="sr-only">Open menu</span>
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

  // Active cycle actions
  if (cycle.status === "active") {
    return (
      <>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon">
              <MoreHorizontal className="h-4 w-4" />
              <span className="sr-only">Open menu</span>
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

        <AlertDialog
          open={showDistributeDialog}
          onOpenChange={setShowDistributeDialog}
        >
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Close Cycle & Distribute Profit</AlertDialogTitle>
              <AlertDialogDescription>
                This will close "{cycle.name}" and distribute profits to all
                investors. Make sure all ventures have reported their realized
                profits. This action cannot be undone.
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

  // Completed cycle actions
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon">
          <MoreHorizontal className="h-4 w-4" />
          <span className="sr-only">Open menu</span>
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