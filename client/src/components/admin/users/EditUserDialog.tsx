"use client";

import { useEffect, useState } from "react";
import { IdCard, Loader2, Pencil, User, UserCog } from "lucide-react";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  useEditUserMutation,
  type AccountStatus,
  type EditUserInput,
  type KycStatusType,
} from "@/store/modules/user";

export interface EditableUser {
  id: string;
  firstName?: string;
  lastName?: string;
  email?: string;
  phoneNumber?: string;
  status?: AccountStatus;
  isEmailVerified?: boolean;
  kyc?: {
    streetAddress?: string;
    city?: string;
    stateRegion?: string;
    countryCode?: string;
    dateOfBirth?: string;
    governmentIdType?: string;
    nextOfKinName?: string;
    nextOfKinRelationship?: string;
    nextOfKinPhone?: string;
    status?: string;
  };
}

interface EditUserDialogProps {
  user: EditableUser;
  defaultTab?: "account" | "kyc";
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  trigger?: React.ReactNode;
  onSuccess?: () => void;
}

export function EditUserDialog({
  user,
  defaultTab = "account",
  open: controlledOpen,
  onOpenChange: controlledOnOpenChange,
  trigger,
  onSuccess,
}: EditUserDialogProps) {
  const [internalOpen, setInternalOpen] = useState(false);
  const isControlled = controlledOpen !== undefined;
  const open = isControlled ? controlledOpen : internalOpen;
  const setOpen = (val: boolean) => {
    if (isControlled) {
      controlledOnOpenChange?.(val);
    } else {
      setInternalOpen(val);
    }
  };

  const [activeTab, setActiveTab] = useState<"account" | "kyc">(defaultTab);

  const initialDob = user.kyc?.dateOfBirth
    ? new Date(user.kyc.dateOfBirth).toISOString().split("T")[0]
    : "";

  const [formData, setFormData] = useState({
    // Account details (roles are DB-only)
    firstName: user.firstName ?? "",
    lastName: user.lastName ?? "",
    email: user.email ?? "",
    phoneNumber: user.phoneNumber ?? "",
    status: (user.status ?? "ACTIVE") as AccountStatus,
    isEmailVerified: Boolean(user.isEmailVerified),
    // KYC details
    streetAddress: user.kyc?.streetAddress ?? "",
    city: user.kyc?.city ?? "",
    stateRegion: user.kyc?.stateRegion ?? "",
    countryCode: user.kyc?.countryCode ?? "NG",
    dateOfBirth: initialDob,
    governmentIdType: user.kyc?.governmentIdType ?? "",
    nextOfKinName: user.kyc?.nextOfKinName ?? "",
    nextOfKinRelationship: user.kyc?.nextOfKinRelationship ?? "",
    nextOfKinPhone: user.kyc?.nextOfKinPhone ?? "",
    kycStatus: (user.kyc?.status ?? "NOT_SUBMITTED") as KycStatusType,
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [apiError, setApiError] = useState<string | null>(null);

  const [editUser, { isLoading }] = useEditUserMutation();

  // Reset form when dialog opens or target user changes
  useEffect(() => {
    if (open) {
      const dob = user.kyc?.dateOfBirth
        ? new Date(user.kyc.dateOfBirth).toISOString().split("T")[0]
        : "";

      setFormData({
        firstName: user.firstName ?? "",
        lastName: user.lastName ?? "",
        email: user.email ?? "",
        phoneNumber: user.phoneNumber ?? "",
        status: (user.status ?? "ACTIVE") as AccountStatus,
        isEmailVerified: Boolean(user.isEmailVerified),
        streetAddress: user.kyc?.streetAddress ?? "",
        city: user.kyc?.city ?? "",
        stateRegion: user.kyc?.stateRegion ?? "",
        countryCode: user.kyc?.countryCode ?? "NG",
        dateOfBirth: dob,
        governmentIdType: user.kyc?.governmentIdType ?? "",
        nextOfKinName: user.kyc?.nextOfKinName ?? "",
        nextOfKinRelationship: user.kyc?.nextOfKinRelationship ?? "",
        nextOfKinPhone: user.kyc?.nextOfKinPhone ?? "",
        kycStatus: (user.kyc?.status ?? "NOT_SUBMITTED") as KycStatusType,
      });
      setActiveTab(defaultTab);
      setErrors({});
      setApiError(null);
    }
  }, [open, user, defaultTab]);

  const validate = (): boolean => {
    const errs: Record<string, string> = {};

    if (!formData.firstName.trim()) {
      errs.firstName = "First name is required";
    }
    if (!formData.lastName.trim()) {
      errs.lastName = "Last name is required";
    }

    const emailTrimmed = formData.email.trim();
    if (!emailTrimmed) {
      errs.email = "Email is required";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(emailTrimmed)) {
      errs.email = "Enter a valid email address";
    }

    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setApiError(null);

    if (!validate()) {
      return;
    }

    // Build diff object containing only modified fields
    const updates: EditUserInput = {};

    const trimmedFirst = formData.firstName.trim();
    if (trimmedFirst !== (user.firstName ?? "")) {
      updates.firstName = trimmedFirst;
    }

    const trimmedLast = formData.lastName.trim();
    if (trimmedLast !== (user.lastName ?? "")) {
      updates.lastName = trimmedLast;
    }

    const trimmedEmail = formData.email.trim();
    if (trimmedEmail !== (user.email ?? "")) {
      updates.email = trimmedEmail;
    }

    const currentPhone = user.phoneNumber ?? "";
    const newPhone = formData.phoneNumber.trim();
    if (newPhone !== currentPhone) {
      updates.phoneNumber = newPhone || undefined;
    }

    if (formData.status !== (user.status ?? "ACTIVE")) {
      updates.status = formData.status;
    }

    if (formData.isEmailVerified !== Boolean(user.isEmailVerified)) {
      updates.isEmailVerified = formData.isEmailVerified;
    }

    // KYC Diff
    const kyc = user.kyc;
    if (formData.streetAddress.trim() !== (kyc?.streetAddress ?? "")) {
      updates.streetAddress = formData.streetAddress.trim() || undefined;
    }
    if (formData.city.trim() !== (kyc?.city ?? "")) {
      updates.city = formData.city.trim() || undefined;
    }
    if (formData.stateRegion.trim() !== (kyc?.stateRegion ?? "")) {
      updates.stateRegion = formData.stateRegion.trim() || undefined;
    }
    if (formData.countryCode.trim() !== (kyc?.countryCode ?? "NG")) {
      updates.countryCode = formData.countryCode.trim() || undefined;
    }
    if (formData.governmentIdType.trim() !== (kyc?.governmentIdType ?? "")) {
      updates.governmentIdType = formData.governmentIdType.trim() || undefined;
    }
    if (formData.nextOfKinName.trim() !== (kyc?.nextOfKinName ?? "")) {
      updates.nextOfKinName = formData.nextOfKinName.trim() || undefined;
    }
    if (formData.nextOfKinRelationship.trim() !== (kyc?.nextOfKinRelationship ?? "")) {
      updates.nextOfKinRelationship = formData.nextOfKinRelationship.trim() || undefined;
    }
    if (formData.nextOfKinPhone.trim() !== (kyc?.nextOfKinPhone ?? "")) {
      updates.nextOfKinPhone = formData.nextOfKinPhone.trim() || undefined;
    }

    if (formData.dateOfBirth !== initialDob) {
      updates.dateOfBirth = formData.dateOfBirth || undefined;
    }

    if (formData.kycStatus !== (kyc?.status ?? "NOT_SUBMITTED")) {
      updates.kycStatus = formData.kycStatus;
    }

    if (Object.keys(updates).length === 0) {
      toast.info("No changes were made");
      setOpen(false);
      return;
    }

    try {
      await editUser({
        id: user.id,
        data: updates,
      }).unwrap();

      toast.success("User and KYC updated successfully");
      setOpen(false);
      onSuccess?.();
    } catch (err: any) {
      const msg =
        err?.data?.message ||
        err?.data?.error ||
        "Failed to update user. Please verify input and try again.";
      setApiError(typeof msg === "string" ? msg : JSON.stringify(msg));
      toast.error("Failed to update user");
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      {trigger ? (
        <DialogTrigger asChild>{trigger}</DialogTrigger>
      ) : (
        !isControlled && (
          <DialogTrigger asChild>
            <Button variant="outline" size="sm" className="gap-1.5">
              <Pencil className="h-3.5 w-3.5" />
              <span>Edit user</span>
            </Button>
          </DialogTrigger>
        )
      )}

      <DialogContent className="max-w-lg sm:max-w-xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-center gap-2">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary/10 text-primary">
              <UserCog className="h-5 w-5" />
            </div>
            <div>
              <DialogTitle className="text-lg">Edit Member Information</DialogTitle>
              <DialogDescription className="text-xs text-muted-foreground">
                Update account details and KYC records. All modifications are logged to the audit trail.
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        {apiError && (
          <div className="rounded-lg border border-destructive/30 bg-destructive/10 p-3 text-xs text-destructive">
            {apiError}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as "account" | "kyc")}>
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="account" className="gap-1.5">
                <User className="h-3.5 w-3.5" />
                <span>Account Info</span>
              </TabsTrigger>
              <TabsTrigger value="kyc" className="gap-1.5">
                <IdCard className="h-3.5 w-3.5" />
                <span>KYC Profile</span>
              </TabsTrigger>
            </TabsList>

            {/* Account Details Tab */}
            <TabsContent value="account" className="space-y-4 pt-2">
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div className="space-y-1.5">
                  <Label htmlFor="firstName" className="text-xs font-medium">
                    First Name <span className="text-destructive">*</span>
                  </Label>
                  <Input
                    id="firstName"
                    value={formData.firstName}
                    onChange={(e) =>
                      setFormData((prev) => ({ ...prev, firstName: e.target.value }))
                    }
                    disabled={isLoading}
                    placeholder="First name"
                    className={errors.firstName ? "border-destructive" : ""}
                  />
                  {errors.firstName && (
                    <p className="text-xs text-destructive">{errors.firstName}</p>
                  )}
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="lastName" className="text-xs font-medium">
                    Last Name <span className="text-destructive">*</span>
                  </Label>
                  <Input
                    id="lastName"
                    value={formData.lastName}
                    onChange={(e) =>
                      setFormData((prev) => ({ ...prev, lastName: e.target.value }))
                    }
                    disabled={isLoading}
                    placeholder="Last name"
                    className={errors.lastName ? "border-destructive" : ""}
                  />
                  {errors.lastName && (
                    <p className="text-xs text-destructive">{errors.lastName}</p>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div className="space-y-1.5">
                  <Label htmlFor="email" className="text-xs font-medium">
                    Email Address <span className="text-destructive">*</span>
                  </Label>
                  <Input
                    id="email"
                    type="email"
                    value={formData.email}
                    onChange={(e) =>
                      setFormData((prev) => ({ ...prev, email: e.target.value }))
                    }
                    disabled={isLoading}
                    placeholder="name@example.com"
                    className={errors.email ? "border-destructive" : ""}
                  />
                  {errors.email && (
                    <p className="text-xs text-destructive">{errors.email}</p>
                  )}
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="phoneNumber" className="text-xs font-medium">
                    Phone Number
                  </Label>
                  <Input
                    id="phoneNumber"
                    type="tel"
                    value={formData.phoneNumber}
                    onChange={(e) =>
                      setFormData((prev) => ({ ...prev, phoneNumber: e.target.value }))
                    }
                    disabled={isLoading}
                    placeholder="+234 800 000 0000"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div className="space-y-1.5">
                  <Label htmlFor="status" className="text-xs font-medium">
                    Account Status
                  </Label>
                  <Select
                    value={formData.status}
                    onValueChange={(val: AccountStatus) =>
                      setFormData((prev) => ({ ...prev, status: val }))
                    }
                    disabled={isLoading}
                  >
                    <SelectTrigger id="status" className="w-full">
                      <SelectValue placeholder="Select status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="ACTIVE">Active</SelectItem>
                      <SelectItem value="SUSPENDED">Suspended</SelectItem>
                      <SelectItem value="DECEASED">Deceased</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="flex items-center space-x-2 rounded-lg border border-border bg-muted/30 p-3 self-end h-10">
                  <Checkbox
                    id="isEmailVerified"
                    checked={formData.isEmailVerified}
                    onCheckedChange={(checked) =>
                      setFormData((prev) => ({ ...prev, isEmailVerified: Boolean(checked) }))
                    }
                    disabled={isLoading}
                  />
                  <Label
                    htmlFor="isEmailVerified"
                    className="cursor-pointer text-xs font-medium leading-none"
                  >
                    Email verified
                  </Label>
                </div>
              </div>
            </TabsContent>

            {/* KYC Profile Tab */}
            <TabsContent value="kyc" className="space-y-4 pt-2">
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div className="space-y-1.5">
                  <Label htmlFor="kycStatus" className="text-xs font-medium">
                    KYC Status
                  </Label>
                  <Select
                    value={formData.kycStatus}
                    onValueChange={(val: KycStatusType) =>
                      setFormData((prev) => ({ ...prev, kycStatus: val }))
                    }
                    disabled={isLoading}
                  >
                    <SelectTrigger id="kycStatus" className="w-full">
                      <SelectValue placeholder="Select KYC status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="NOT_SUBMITTED">Not Submitted</SelectItem>
                      <SelectItem value="SUBMITTED">Submitted</SelectItem>
                      <SelectItem value="PENDING_MANUAL_REVIEW">Pending Manual Review</SelectItem>
                      <SelectItem value="VERIFIED">Verified</SelectItem>
                      <SelectItem value="REJECTED">Rejected</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="governmentIdType" className="text-xs font-medium">
                    Government ID Type
                  </Label>
                  <Input
                    id="governmentIdType"
                    value={formData.governmentIdType}
                    onChange={(e) =>
                      setFormData((prev) => ({ ...prev, governmentIdType: e.target.value }))
                    }
                    disabled={isLoading}
                    placeholder="National ID / Passport / Driver's License"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div className="space-y-1.5">
                  <Label htmlFor="dateOfBirth" className="text-xs font-medium">
                    Date of Birth
                  </Label>
                  <Input
                    id="dateOfBirth"
                    type="date"
                    value={formData.dateOfBirth}
                    onChange={(e) =>
                      setFormData((prev) => ({ ...prev, dateOfBirth: e.target.value }))
                    }
                    disabled={isLoading}
                  />
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="countryCode" className="text-xs font-medium">
                    Country Code
                  </Label>
                  <Input
                    id="countryCode"
                    maxLength={3}
                    value={formData.countryCode}
                    onChange={(e) =>
                      setFormData((prev) => ({ ...prev, countryCode: e.target.value.toUpperCase() }))
                    }
                    disabled={isLoading}
                    placeholder="NG"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="streetAddress" className="text-xs font-medium">
                  Street Address
                </Label>
                <Input
                  id="streetAddress"
                  value={formData.streetAddress}
                  onChange={(e) =>
                    setFormData((prev) => ({ ...prev, streetAddress: e.target.value }))
                  }
                  disabled={isLoading}
                  placeholder="Street and house number"
                />
              </div>

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div className="space-y-1.5">
                  <Label htmlFor="city" className="text-xs font-medium">
                    City
                  </Label>
                  <Input
                    id="city"
                    value={formData.city}
                    onChange={(e) =>
                      setFormData((prev) => ({ ...prev, city: e.target.value }))
                    }
                    disabled={isLoading}
                    placeholder="City"
                  />
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="stateRegion" className="text-xs font-medium">
                    State / Region
                  </Label>
                  <Input
                    id="stateRegion"
                    value={formData.stateRegion}
                    onChange={(e) =>
                      setFormData((prev) => ({ ...prev, stateRegion: e.target.value }))
                    }
                    disabled={isLoading}
                    placeholder="State or Region"
                  />
                </div>
              </div>

              {/* Next of Kin Section */}
              <div className="border-t pt-3 space-y-3">
                <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                  Next of Kin
                </p>

                <div className="space-y-1.5">
                  <Label htmlFor="nextOfKinName" className="text-xs font-medium">
                    Next of Kin Full Name
                  </Label>
                  <Input
                    id="nextOfKinName"
                    value={formData.nextOfKinName}
                    onChange={(e) =>
                      setFormData((prev) => ({ ...prev, nextOfKinName: e.target.value }))
                    }
                    disabled={isLoading}
                    placeholder="Full name"
                  />
                </div>

                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <div className="space-y-1.5">
                    <Label htmlFor="nextOfKinRelationship" className="text-xs font-medium">
                      Relationship
                    </Label>
                    <Input
                      id="nextOfKinRelationship"
                      value={formData.nextOfKinRelationship}
                      onChange={(e) =>
                        setFormData((prev) => ({
                          ...prev,
                          nextOfKinRelationship: e.target.value,
                        }))
                      }
                      disabled={isLoading}
                      placeholder="e.g. Spouse / Brother / Sister"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <Label htmlFor="nextOfKinPhone" className="text-xs font-medium">
                      Next of Kin Phone
                    </Label>
                    <Input
                      id="nextOfKinPhone"
                      type="tel"
                      value={formData.nextOfKinPhone}
                      onChange={(e) =>
                        setFormData((prev) => ({ ...prev, nextOfKinPhone: e.target.value }))
                      }
                      disabled={isLoading}
                      placeholder="+234 800 000 0000"
                    />
                  </div>
                </div>
              </div>
            </TabsContent>
          </Tabs>

          <DialogFooter className="gap-2 sm:gap-0 pt-2 border-t">
            <Button
              type="button"
              variant="outline"
              size="sm"
              disabled={isLoading}
              onClick={() => setOpen(false)}
            >
              Cancel
            </Button>
            <Button type="submit" size="sm" disabled={isLoading} className="gap-1.5">
              {isLoading && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
              Save changes
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
