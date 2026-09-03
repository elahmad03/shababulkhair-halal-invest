// components/admin/users/user-profile-card.tsx
"use client";

import { useState } from "react";
import { BadgeCheck, Loader2, Mail, Phone, ShieldCheck } from "lucide-react";
import { useUpdateUserStatusMutation, type UserDetail } from "@/store/modules/user/userApi";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { accountTone, currencyForCountry, initials, money, resolveDocumentUrl, titleCase, toneClass } from "../utils";

export function UserProfileCard({ user }: { user: UserDetail }) {
  const [updateStatus, { isLoading }] = useUpdateUserStatusMutation();
  const [error, setError] = useState<string | null>(null);
  const [open, setOpen] = useState(false);

  const status = user.status;
  const isActive = status === "ACTIVE";
  const isSuspended = status === "SUSPENDED";
  const isDeceased = status === "DECEASED";
  const currency = currencyForCountry(user.kyc?.countryCode);
  const avatarSrc = resolveDocumentUrl(user.kyc?.avatarUrl ?? user.avatarUrl);

  async function handleConfirm() {
    setError(null);
    try {
      await updateStatus({ id: user.id, status: isActive ? "SUSPENDED" : "ACTIVE" }).unwrap();
      setOpen(false);
    } catch {
      setError("Couldn't update this member's status. Try again.");
    }
  }

  return (
    <Card>
      <CardHeader className="flex flex-col items-center gap-3 text-center sm:flex-row sm:items-start sm:text-left">
        <Avatar className="h-16 w-16 flex-none sm:h-14 sm:w-14">
          <AvatarImage src={avatarSrc} alt="" />
          <AvatarFallback className="text-base font-semibold">
            {initials(user.firstName, user.lastName)}
          </AvatarFallback>
        </Avatar>
        <div className="min-w-0">
          <CardTitle className="truncate text-base">
            {user.firstName} {user.lastName}
          </CardTitle>
          <div className="mt-1.5 flex flex-wrap items-center justify-center gap-1.5 sm:justify-start">
            <Badge variant="outline" className="gap-1">
              <ShieldCheck className="h-3 w-3" />
              {titleCase(user.role)}
            </Badge>
            <Badge className={toneClass(accountTone(status))}>{titleCase(status)}</Badge>
          </div>
        </div>
      </CardHeader>

      <CardContent className="flex flex-col gap-4">
        <div className="flex flex-col gap-2 text-sm">
          <div className="flex items-center gap-2 text-muted-foreground">
            <Mail className="h-3.5 w-3.5 flex-none" />
            <span className="truncate">{user.email}</span>
          </div>
          <div className="flex items-center gap-2 text-muted-foreground">
            <Phone className="h-3.5 w-3.5 flex-none" />
            <span>{user.phoneNumber || "Not provided"}</span>
          </div>
        </div>

        <div className="flex items-center justify-between rounded-lg border bg-muted/30 px-3 py-2.5">
          <span className="text-xs text-muted-foreground">Wallet balance</span>
          <span className="font-mono text-sm font-semibold tabular-nums">
            {money(user.wallet?.balance, currency)}
          </span>
        </div>

        {isDeceased ? (
          <p className="rounded-lg bg-muted/40 px-3 py-2 text-xs text-muted-foreground">
            This account is deceased. Deceased accounts are reinstated through the moderation flow, not
            from here.
          </p>
        ) : (
          <AlertDialog open={open} onOpenChange={setOpen}>
            <AlertDialogTrigger asChild>
              <Button
                variant={isActive ? "destructive" : "default"}
                size="sm"
                className="w-full"
                disabled={isLoading}
              >
                {isLoading && <Loader2 className="mr-2 h-3.5 w-3.5 animate-spin" />}
                {isActive ? "Suspend member" : "Activate member"}
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>
                  {isActive ? "Suspend this member?" : "Activate this member?"}
                </AlertDialogTitle>
                <AlertDialogDescription>
                  {isActive
                    ? `${user.firstName} ${user.lastName} will lose access to the platform until reactivated.`
                    : `${user.firstName} ${user.lastName} will regain full access to the platform.`}
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel disabled={isLoading}>Cancel</AlertDialogCancel>
                <AlertDialogAction
                  onClick={(e) => {
                    e.preventDefault();
                    handleConfirm();
                  }}
                  disabled={isLoading}
                  className={isActive ? "bg-destructive text-destructive-foreground hover:bg-destructive/90" : ""}
                >
                  {isLoading && <Loader2 className="mr-2 h-3.5 w-3.5 animate-spin" />}
                  Confirm
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        )}

        {error && <p className="text-xs text-destructive">{error}</p>}

        {["APPROVED", "VERIFIED"].includes((user.kyc?.status ?? "").toUpperCase()) && (
          <p className="flex items-center gap-1.5 text-xs text-muted-foreground">
            <BadgeCheck className="h-3.5 w-3.5 text-emerald-500" />
            Identity verified
          </p>
        )}
      </CardContent>
    </Card>
  );
}