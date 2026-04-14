"use client";

import { useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Image from "next/image";
import { format } from "date-fns";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  AlertCircle,
  ArrowLeft,
  CheckCircle2,
  FileText,
  Loader2,
  XCircle,
  ZoomIn,
} from "lucide-react";

import {
  useGetKycDetailQuery,
  useApproveKycMutation,
  useRejectKycMutation,
} from "@/store/modules/kyc/adminKycApi";

// ─── Image viewer ─────────────────────────────────────────────────────────────

interface DocImageProps {
  url: string | null;
  label: string;
}

function DocImage({ url, label }: DocImageProps) {
  const [open, setOpen] = useState(false);

  if (!url) {
    return (
      <div className="rounded-xl border bg-muted/30 h-44 flex flex-col items-center justify-center gap-2 text-muted-foreground/40">
        <FileText className="h-8 w-8" />
        <span className="text-xs">Not provided</span>
      </div>
    );
  }

  return (
    <>
      <div
        className="relative rounded-xl overflow-hidden border bg-muted h-44 cursor-zoom-in group"
        onClick={() => setOpen(true)}
      >
        <Image src={url} alt={label} fill className="object-cover" unoptimized />
        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/30 transition-colors flex items-center justify-center">
          <ZoomIn className="h-6 w-6 text-white opacity-0 group-hover:opacity-100 transition-opacity" />
        </div>
      </div>

      {/* Lightbox */}
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-3xl p-2 bg-black border-0">
          <div className="relative w-full h-[70vh]">
            <Image src={url} alt={label} fill className="object-contain" unoptimized />
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}

// ─── Info row ─────────────────────────────────────────────────────────────────

function InfoRow({ label, value }: { label: string; value?: string | null }) {
  return (
    <div className="flex justify-between py-2 border-b last:border-0 gap-4">
      <span className="text-sm text-muted-foreground shrink-0">{label}</span>
      <span className="text-sm font-medium text-right">{value || "—"}</span>
    </div>
  );
}

// ─── Status badge ─────────────────────────────────────────────────────────────

function StatusBadge({ status }: { status: string }) {
  const map: Record<string, { label: string; className: string }> = {
    PENDING_REVIEW: { label: "Pending Review", className: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400" },
    VERIFIED:       { label: "Verified",       className: "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400" },
    REJECTED:       { label: "Rejected",       className: "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400" },
  };

  const cfg = map[status] ?? { label: status, className: "bg-muted text-muted-foreground" };

  return (
    <Badge variant="outline" className={`border-0 font-semibold text-sm px-3 py-1 ${cfg.className}`}>
      {cfg.label}
    </Badge>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function AdminKycDetailPage() {
  const { kycId } = useParams<{ kycId: string }>();
  const router = useRouter();

  const { data, isLoading, isError } = useGetKycDetailQuery(kycId);
  const [approveKyc, { isLoading: isApproving }] = useApproveKycMutation();
  const [rejectKyc,  { isLoading: isRejecting }]  = useRejectKycMutation();

  const [rejectOpen, setRejectOpen]   = useState(false);
  const [rejectReason, setRejectReason] = useState("");

 const kyc = data?.data;
  const isBusy = isApproving || isRejecting;
  const isPending = kyc?.kycStatus === "PENDING_REVIEW";

  const handleApprove = async () => {
    try {
      await approveKyc(kycId).unwrap();
      toast.success("KYC approved successfully.");
      router.push("/admin/kyc");
    } catch (err: any) {
      toast.error("Approval failed", { description: err?.data?.message });
    }
  };

  const handleReject = async () => {
    if (!rejectReason.trim()) {
      toast.error("Please provide a rejection reason.");
      return;
    }
    try {
      await rejectKyc({ kycId, reason: rejectReason }).unwrap();
      toast.success("KYC rejected.");
      router.push("/admin/kyc");
    } catch (err: any) {
      toast.error("Rejection failed", { description: err?.data?.message });
    }
  };

  // ── Loading ─────────────────────────────────────────────────────────────────

  if (isLoading) {
    return (
      <div className="max-w-4xl mx-auto p-6 space-y-6">
        <Skeleton className="h-8 w-48" />
        <div className="grid grid-cols-3 gap-4">
          {[0,1,2].map((i) => <Skeleton key={i} className="h-44 rounded-xl" />)}
        </div>
        <Skeleton className="h-48 rounded-xl" />
      </div>
    );
  }

  if (isError || !kyc) {
    return (
      <div className="max-w-4xl mx-auto p-6">
        <div className="flex items-center gap-2 rounded-lg border border-destructive/30 bg-destructive/5 p-4 text-destructive">
          <AlertCircle className="h-4 w-4 shrink-0" />
          Failed to load KYC record.
        </div>
      </div>
    );
  }

  // ── Render ──────────────────────────────────────────────────────────────────

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">

      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div className="flex items-center gap-3">
          <Button
            variant="ghost"
            size="sm"
            className="gap-2"
            onClick={() => router.push("/admin/kyc")}
          >
            <ArrowLeft className="h-4 w-4" /> Back
          </Button>
          <div>
            <h1 className="text-xl font-bold">
              {kyc.user?.firstName} {kyc.user?.lastName}
            </h1>
            <p className="text-sm text-muted-foreground">{kyc.user?.email}</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <StatusBadge status={kyc.kycStatus} />
          <span className="text-xs text-muted-foreground">
            Submitted {format(new Date(kyc.createdAt), "dd MMM yyyy")}
          </span>
        </div>
      </div>

      {/* Document images */}
      <div className="space-y-2">
        <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">
          Documents
        </h2>
        <div className="grid grid-cols-3 gap-4">
          <div className="space-y-1.5">
            <p className="text-xs text-muted-foreground">Profile Photo</p>
            <DocImage url={kyc.avatarUrl} label="Profile Photo" />
          </div>
          <div className="space-y-1.5">
            <p className="text-xs text-muted-foreground">ID Card — Front</p>
            <DocImage url={kyc.idCardFrontUrl} label="ID Front" />
          </div>
          <div className="space-y-1.5">
            <p className="text-xs text-muted-foreground">ID Card — Back</p>
            <DocImage url={kyc.idCardBackUrl} label="ID Back" />
          </div>
        </div>
        <p className="text-xs text-muted-foreground">Click an image to enlarge.</p>
      </div>

      {/* Info grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

        {/* Personal */}
        <div className="rounded-xl border p-4 space-y-1">
          <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground mb-2">
            Personal
          </p>
          <InfoRow label="Date of Birth"  value={kyc.dateOfBirth ? format(new Date(kyc.dateOfBirth), "dd MMM yyyy") : null} />
          <InfoRow label="Government ID"  value={kyc.governmentIdType?.replace(/_/g, " ")} />
        </div>

        {/* Address */}
        <div className="rounded-xl border p-4 space-y-1">
          <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground mb-2">
            Address
          </p>
          <InfoRow label="Street"  value={kyc.streetAddress} />
          <InfoRow label="City"    value={kyc.city} />
          <InfoRow label="State"   value={kyc.stateRegion} />
          <InfoRow label="Country" value={kyc.countryCode} />
        </div>

        {/* Next of kin */}
        <div className="rounded-xl border p-4 space-y-1">
          <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground mb-2">
            Next of Kin
          </p>
          <InfoRow label="Name"         value={kyc.nextOfKinName} />
          <InfoRow label="Relationship" value={kyc.nextOfKinRelationship} />
          <InfoRow label="Phone"        value={kyc.nextOfKinPhone} />
        </div>

        {/* Review history */}
        <div className="rounded-xl border p-4 space-y-1">
          <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground mb-2">
            Review History
          </p>
          <InfoRow label="Version"     value={`v${kyc.version}`} />
          <InfoRow label="Reviewed at" value={kyc.reviewedAt ? format(new Date(kyc.reviewedAt), "dd MMM yyyy, HH:mm") : "Not yet reviewed"} />
          {kyc.rejectedReason && (
            <InfoRow label="Reject reason" value={kyc.rejectedReason} />
          )}
        </div>
      </div>

      {/* Action buttons — only shown for pending records */}
      {isPending && (
        <div className="flex gap-3 pt-2">
          <Button
            className="flex-1 gap-2 bg-green-600 hover:bg-green-700 text-white"
            onClick={handleApprove}
            disabled={isBusy}
          >
            {isApproving
              ? <><Loader2 className="h-4 w-4 animate-spin" /> Approving…</>
              : <><CheckCircle2 className="h-4 w-4" /> Approve KYC</>
            }
          </Button>

          <Button
            variant="destructive"
            className="flex-1 gap-2"
            onClick={() => setRejectOpen(true)}
            disabled={isBusy}
          >
            <XCircle className="h-4 w-4" /> Reject KYC
          </Button>
        </div>
      )}

      {/* Already actioned notice */}
      {!isPending && (
        <div className={`flex items-center gap-2 rounded-lg p-4 text-sm ${
          kyc.kycStatus === "VERIFIED"
            ? "bg-green-50 text-green-700 dark:bg-green-950/20"
            : "bg-red-50 text-red-700 dark:bg-red-950/20"
        }`}>
          {kyc.kycStatus === "VERIFIED"
            ? <CheckCircle2 className="h-4 w-4 shrink-0" />
            : <XCircle className="h-4 w-4 shrink-0" />
          }
          This KYC has been {kyc.kycStatus === "VERIFIED" ? "approved" : "rejected"} and cannot be changed.
        </div>
      )}

      {/* Reject dialog */}
      <Dialog open={rejectOpen} onOpenChange={setRejectOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Reject KYC Submission</DialogTitle>
            <DialogDescription>
              Provide a clear reason so the user knows what to fix and resubmit.
            </DialogDescription>
          </DialogHeader>

          <Textarea
            placeholder="e.g. ID card image is blurry and unreadable. Please resubmit a clearer photo."
            value={rejectReason}
            onChange={(e) => setRejectReason(e.target.value)}
            rows={4}
            className="resize-none"
          />

          <DialogFooter className="gap-2">
            <Button variant="outline" onClick={() => setRejectOpen(false)} disabled={isRejecting}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleReject} disabled={isRejecting || !rejectReason.trim()}>
              {isRejecting
                ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Rejecting…</>
                : "Confirm Rejection"
              }
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}