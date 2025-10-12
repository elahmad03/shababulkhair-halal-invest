"use client"

import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogClose
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

interface AdminWithdrawalActionsProps {
  requestId: number;
  onAction: (requestId: number) => void;
}

export function AdminWithdrawalActions({ requestId, onAction }: AdminWithdrawalActionsProps) {
    const [rejectionReason, setRejectionReason] = useState("");
    const [isDialogOpen, setIsDialogOpen] = useState(false);

    const handleApprove = () => {
        console.log(`Approving request ${requestId}...`);
        // API call: await approveWithdrawal(requestId);
        alert(`Request ${requestId} has been approved.`);
        onAction(requestId);
    };

    const handleReject = () => {
        if (!rejectionReason.trim()) {
            alert("Please provide a reason for rejection.");
            return;
        }
        console.log(`Rejecting request ${requestId} for reason: ${rejectionReason}`);
        // API call: await rejectWithdrawal(requestId, rejectionReason);
        alert(`Request ${requestId} has been rejected.`);
        onAction(requestId);
        setIsDialogOpen(false); // Close the dialog
    };
  
    return (
        <div className="flex w-full gap-2 justify-center">
            <Button size="sm" onClick={handleApprove} className="flex-1 bg-green-600 hover:bg-green-700">
                Approve
            </Button>
            
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                <DialogTrigger asChild>
                    <Button size="sm" variant="destructive" className="flex-1">
                        Reject
                    </Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-[425px]">
                    <DialogHeader>
                    <DialogTitle>Reason for Rejection</DialogTitle>
                    <DialogDescription>
                        This note will be visible to the user. Please be clear and concise.
                    </DialogDescription>
                    </DialogHeader>
                    <div className="grid gap-4 py-4">
                        <div className="grid grid-cols-4 items-center gap-4">
                            <Label htmlFor="reason" className="text-right">
                                Reason
                            </Label>
                            <Textarea
                                id="reason"
                                value={rejectionReason}
                                onChange={(e) => setRejectionReason(e.target.value)}
                                className="col-span-3"
                                placeholder="e.g., Insufficient identity verification."
                            />
                        </div>
                    </div>
                    <DialogFooter>
                        <DialogClose asChild>
                            <Button variant="ghost">Cancel</Button>
                        </DialogClose>
                        <Button type="button" variant="destructive" onClick={handleReject}>
                            Confirm Rejection
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
}