"use client";

import Image from "next/image";
import { Badge } from "@/components/ui/badge";
import { CheckCircle2, FileText, XCircle } from "lucide-react";
import type { KycUploadType, ReviewStepProps } from "./kyc.types";

// ─── Helpers ──────────────────────────────────────────────────────────────────

interface ReviewRowProps {
  label: string;
  value?: string | null;
}

function ReviewRow({ label, value }: ReviewRowProps) {
  return (
    <>
      <span className="text-muted-foreground text-sm">{label}</span>
      <span className="text-sm font-medium">{value || "—"}</span>
    </>
  );
}

interface ReviewSectionProps {
  title: string;
  children: React.ReactNode;
}

function ReviewSection({ title, children }: ReviewSectionProps) {
  return (
    <div className="rounded-xl border bg-card p-4 space-y-3">
      <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">
        {title}
      </p>
      <div className="grid grid-cols-2 gap-y-2.5">{children}</div>
    </div>
  );
}

// ─── Document preview thumbnail ───────────────────────────────────────────────

interface DocPreviewProps {
  label: string;
  file: File | null;
  uploaded: boolean;
}

function DocPreview({ label, file, uploaded }: DocPreviewProps) {
  const previewUrl = file ? URL.createObjectURL(file) : null;
  const isPdf = file?.type === "application/pdf";

  return (
    <div className="space-y-1.5">
      <p className="text-xs text-muted-foreground">{label}</p>
      <div className="relative rounded-lg overflow-hidden border bg-muted h-24 w-full flex items-center justify-center">
        {previewUrl && !isPdf ? (
          <Image
            src={previewUrl}
            alt={label}
            fill
            className="object-cover"
            unoptimized
          />
        ) : previewUrl && isPdf ? (
          <div className="flex flex-col items-center gap-1 text-muted-foreground">
            <FileText className="h-6 w-6" />
            <span className="text-xs truncate max-w-[100px]">{file?.name}</span>
          </div>
        ) : (
          <div className="flex flex-col items-center gap-1 text-muted-foreground/40">
            <FileText className="h-6 w-6" />
            <span className="text-xs">No file</span>
          </div>
        )}

        {/* Status badge overlay */}
        <div className="absolute top-1.5 right-1.5">
          {uploaded ? (
            <Badge className="gap-1 text-[10px] px-1.5 py-0.5 bg-green-600 text-white border-0">
              <CheckCircle2 className="h-2.5 w-2.5" /> Ready
            </Badge>
          ) : (
            <Badge variant="destructive" className="gap-1 text-[10px] px-1.5 py-0.5">
              <XCircle className="h-2.5 w-2.5" /> Missing
            </Badge>
          )}
        </div>
      </div>
    </div>
  );
}

// ─── Review Step ──────────────────────────────────────────────────────────────

const DOC_LABELS: Record<KycUploadType, string> = {
  avatar: "Profile Photo",
  front:  "ID Front",
  back:   "ID Back",
};

export function ReviewStep({ form, uploads }: ReviewStepProps) {
  const v = form.getValues();

  return (
    <div className="space-y-4">
      <p className="text-sm text-muted-foreground">
        Review everything carefully before submitting. Go back to make changes.
      </p>

      {/* Documents preview grid */}
      <div className="rounded-xl border bg-card p-4 space-y-3">
        <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">
          Documents
        </p>
        <div className="grid grid-cols-3 gap-3">
          {(["avatar", "front", "back"] as KycUploadType[]).map((type) => (
            <DocPreview
              key={type}
              label={DOC_LABELS[type]}
              file={uploads[type].file}
              uploaded={!!uploads[type].url}
            />
          ))}
        </div>
      </div>

      <ReviewSection title="Personal">
        <ReviewRow label="Date of Birth"   value={v.dateOfBirth} />
        <ReviewRow label="Government ID"   value={v.governmentIdType?.replace("_", " ")} />
      </ReviewSection>

      <ReviewSection title="Address">
        <ReviewRow label="Street"  value={v.streetAddress} />
        <ReviewRow label="City"    value={v.city} />
        <ReviewRow label="State"   value={v.stateRegion} />
        <ReviewRow label="Country" value={v.countryCode} />
      </ReviewSection>

      <ReviewSection title="Next of Kin">
        <ReviewRow label="Name"         value={v.nextOfKinName} />
        <ReviewRow label="Relationship" value={v.nextOfKinRelationship} />
        <ReviewRow label="Phone"        value={v.nextOfKinPhone} />
      </ReviewSection>
    </div>
  );
}