'use client'; 
import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogTrigger,
  DialogClose,
} from "@/components/ui/dialog";
import { User } from "@/schemas/app";
import type { UserProfile } from "@/db/types";

export function UserProfileCard({ user, profile }: { user: User; profile?: UserProfile }) {
  const [isRejectOpen, setIsRejectOpen] = useState(false);
  const kycStatus = profile?.kycStatus ?? "not_submitted";

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center gap-4">
          <Avatar className="w-20 h-20">
            {profile?.profilePictureUrl ? (
              <AvatarImage src={profile.profilePictureUrl} />
            ) : (
              <AvatarFallback>{user.fullName?.charAt(0) ?? "U"}</AvatarFallback>
            )}
          </Avatar>
          <div className="flex-1">
            <CardTitle className="text-lg">{user.fullName}</CardTitle>
            <p className="text-sm text-muted-foreground">{user.email}</p>
          </div>
          <div className="flex flex-col items-end gap-2">
            <Badge className="capitalize">{kycStatus.replace('_', ' ')}</Badge>
            {kycStatus === "pending_review" && (
              <div className="flex gap-2">
                <Button variant="default" className="bg-emerald-600 hover:bg-emerald-700 text-white">
                  Approve KYC
                </Button>
                <Dialog open={isRejectOpen} onOpenChange={setIsRejectOpen}>
                  <DialogTrigger asChild>
                    <Button variant="destructive">Reject KYC</Button>
                  </DialogTrigger>
                  <DialogContent className="sm:max-w-[480px]">
                    <DialogHeader>
                      <DialogTitle>Reject KYC</DialogTitle>
                      <DialogDescription>Provide a short reason for rejecting this user's KYC.</DialogDescription>
                    </DialogHeader>
                    <div className="mt-2">
                      <textarea name="reason" rows={4} className="w-full border p-2 rounded" placeholder="Reason for rejection" />
                    </div>
                    <DialogFooter className="mt-4 flex justify-end gap-2">
                      <DialogClose asChild>
                        <Button variant="outline">Cancel</Button>
                      </DialogClose>
                      <Button onClick={() => { console.log('Rejected KYC for', user.id); setIsRejectOpen(false); }} className="bg-red-600">Reject</Button>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>
              </div>
            )}
          </div>
        </div>
      </CardHeader>
      <CardContent className="pt-0 text-sm">
        <div className="grid grid-cols-1 gap-1">
          <p><strong className="inline-block w-24">Role:</strong> <span className="capitalize">{user.role}</span></p>
          <p><strong className="inline-block w-24">Phone:</strong> {user.phoneNumber ?? 'N/A'}</p>
        </div>
      </CardContent>
    </Card>
  );
}