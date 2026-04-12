"use client";

import { useRef } from "react";
import Image from "next/image";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import {
  AlertCircle,
  CheckCircle2,
  FileText,
  Loader2,
  RefreshCw,
  Upload,
  User,
} from "lucide-react";
import type { DocumentsStepProps, KycUploadType, UploadState } from "./kyc.types";

// ─── Upload Card ──────────────────────────────────────────────────────────────

interface UploadCardProps {
  type: KycUploadType;
  label: string;
  description: string;
  state: UploadState;
  onUpload: (type: KycUploadType, file: File) => Promise<void>;
}

function UploadCard({ type, label, description, state, onUpload }: UploadCardProps) {
  const inputRef = useRef<HTMLInputElement>(null);

  const handleClick = () => {
    if (!state.uploading) inputRef.current?.click();
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) onUpload(type, file);
    e.target.value = "";
  };

  // Generate local object URL for preview from the File object
  const previewUrl = state.file ? URL.createObjectURL(state.file) : null;
  const isPdf = state.file?.type === "application/pdf";
  const isAvatar = type === "avatar";

  return (
    <div
      className={`rounded-xl border-2 border-dashed transition-all duration-200 overflow-hidden ${
        state.url
          ? "border-green-500/50 bg-green-50/40 dark:bg-green-950/10"
          : state.error
          ? "border-destructive/40 bg-destructive/5"
          : "border-muted-foreground/25 hover:border-primary/40 hover:bg-muted/20"
      }`}
    >
      {/* ── Preview area ── */}
      {previewUrl && !isPdf && (
        <div
          className={`relative w-full bg-muted/30 overflow-hidden ${
            isAvatar ? "h-40" : "h-36"
          }`}
        >
          <Image
            src={previewUrl}
            alt={label}
            fill
            className={`object-cover ${isAvatar ? "object-top" : "object-center"}`}
            unoptimized // local blob URL, no Next.js optimisation needed
          />
          {/* Overlay status */}
          {state.uploading && (
            <div className="absolute inset-0 bg-black/50 flex flex-col items-center justify-center gap-2">
              <Loader2 className="h-6 w-6 text-white animate-spin" />
              <span className="text-white text-xs font-medium">{state.progress}%</span>
            </div>
          )}
          {state.url && !state.uploading && (
            <div className="absolute top-2 right-2">
              <Badge className="gap-1 bg-green-600 text-white border-0 shadow">
                <CheckCircle2 className="h-3 w-3" /> Done
              </Badge>
            </div>
          )}
        </div>
      )}

      {/* PDF preview placeholder */}
      {previewUrl && isPdf && (
        <div className="h-24 bg-muted/30 flex items-center justify-center gap-3">
          <FileText className="h-8 w-8 text-primary/60" />
          <div>
            <p className="text-sm font-medium truncate max-w-[180px]">{state.file?.name}</p>
            <p className="text-xs text-muted-foreground">PDF document</p>
          </div>
          {state.url && (
            <Badge className="gap-1 bg-green-600 text-white border-0">
              <CheckCircle2 className="h-3 w-3" /> Done
            </Badge>
          )}
        </div>
      )}

      {/* ── Card body ── */}
      <div className="p-4 space-y-3">
        <div className="flex items-start justify-between gap-2">
          <div className="flex items-center gap-2.5">
            {/* Placeholder icon when no preview */}
            {!previewUrl && (
              <div className="h-9 w-9 rounded-lg bg-muted flex items-center justify-center shrink-0">
                {isAvatar
                  ? <User className="h-4.5 w-4.5 text-muted-foreground" />
                  : <FileText className="h-4.5 w-4.5 text-muted-foreground" />
                }
              </div>
            )}
            <div>
              <p className="font-medium text-sm leading-tight">{label}</p>
              <p className="text-xs text-muted-foreground">{description}</p>
            </div>
          </div>

          {state.error && (
            <Badge variant="destructive" className="gap-1 shrink-0">
              <AlertCircle className="h-3 w-3" /> Failed
            </Badge>
          )}
        </div>

        {/* Progress bar — shown even without image preview */}
        {state.uploading && !previewUrl && (
          <div className="space-y-1">
            <Progress value={state.progress} className="h-1.5" />
            <p className="text-xs text-muted-foreground">{state.progress}% uploading…</p>
          </div>
        )}

        {state.error && (
          <p className="text-xs text-destructive">{state.error}</p>
        )}

        {/* Hidden input */}
        <input
          ref={inputRef}
          type="file"
          className="hidden"
          accept=".jpg,.jpeg,.png,.pdf"
          onChange={handleChange}
        />

        <Button
          type="button"
          variant={state.url ? "secondary" : "outline"}
          size="sm"
          className="gap-2 w-full"
          onClick={handleClick}
          disabled={state.uploading}
        >
          {state.uploading ? (
            <><Loader2 className="h-3.5 w-3.5 animate-spin" /> Uploading…</>
          ) : state.url ? (
            <><RefreshCw className="h-3.5 w-3.5" /> Replace</>
          ) : (
            <><Upload className="h-3.5 w-3.5" /> Choose file</>
          )}
        </Button>
      </div>
    </div>
  );
}

// ─── Documents Step ───────────────────────────────────────────────────────────

const DOCUMENT_CARDS: Array<{
  type: KycUploadType;
  label: string;
  description: string;
}> = [
  {
    type: "avatar",
    label: "Profile Photo",
    description: "Clear face photo — no sunglasses or hats",
  },
  {
    type: "front",
    label: "ID Card — Front",
    description: "Front side of your government ID",
  },
  {
    type: "back",
    label: "ID Card — Back",
    description: "Back side of your government ID",
  },
];

export function DocumentsStep({ uploads, onUpload }: DocumentsStepProps) {
  return (
    <div className="space-y-4">
      <p className="text-sm text-muted-foreground">
        Upload clear photos or scans. Accepted: JPG, PNG, PDF — max 10MB each.
      </p>

      <div className="grid grid-cols-1 gap-4">
        {DOCUMENT_CARDS.map((card) => (
          <UploadCard
            key={card.type}
            {...card}
            state={uploads[card.type]}
            onUpload={onUpload}
          />
        ))}
      </div>
    </div>
  );
}