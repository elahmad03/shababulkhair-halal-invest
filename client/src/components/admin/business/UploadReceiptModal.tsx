"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Loader2, FileText, ExternalLink, CheckCircle, Upload } from "lucide-react";
import { toast } from "sonner";
import { useUploadAgreementReceiptMutation } from "@/store/modules/venture/ventureApi";
import type { Venture } from "@/store/modules/venture/venture.types";

interface UploadReceiptModalProps {
  venture: Venture | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess?: () => void;
}

export const UploadReceiptModal = ({
  venture,
  open,
  onOpenChange,
  onSuccess,
}: UploadReceiptModalProps) => {
  const [receiptUrl, setReceiptUrl] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [uploadReceipt, { isLoading }] = useUploadAgreementReceiptMutation();

  useEffect(() => {
    if (venture) {
      setReceiptUrl(venture.agreementReceiptUrl || "");
      setError(null);
    }
  }, [venture, open]);

  if (!venture) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    const trimmed = receiptUrl.trim();
    if (!trimmed) {
      setError("Receipt URL is required");
      return;
    }

    try {
      new URL(trimmed);
    } catch {
      setError("Please enter a valid URL (e.g., https://res.cloudinary.com/...)");
      return;
    }

    try {
      await uploadReceipt({
        ventureId: venture.id,
        agreementReceiptUrl: trimmed,
      }).unwrap();

      toast.success("Agreement receipt saved successfully");
      onOpenChange(false);
      onSuccess?.();
    } catch (err: any) {
      const msg = err?.data?.message || "Failed to upload agreement receipt";
      setError(msg);
      toast.error(msg);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <div className="flex items-center gap-2">
            <div className="h-9 w-9 rounded-full bg-primary/10 flex items-center justify-center text-primary">
              <FileText className="h-5 w-5" />
            </div>
            <div>
              <DialogTitle>Agreement Receipt</DialogTitle>
              <DialogDescription>
                {venture.companyName}
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        {venture.agreementReceiptUrl && (
          <div className="rounded-lg border border-border p-3 bg-muted/40 text-sm space-y-1">
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground text-xs font-medium">Current Receipt</span>
              <a
                href={venture.agreementReceiptUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="text-primary hover:underline text-xs flex items-center gap-1 font-medium"
              >
                View Document <ExternalLink className="h-3 w-3" />
              </a>
            </div>
            {venture.agreementUploadedAt && (
              <p className="text-xs text-muted-foreground">
                Uploaded: {new Date(venture.agreementUploadedAt).toLocaleDateString("en-US", {
                  year: "numeric",
                  month: "short",
                  day: "numeric",
                })}
                {venture.agreementUploadedBy && ` by ${venture.agreementUploadedBy.firstName} ${venture.agreementUploadedBy.lastName}`}
              </p>
            )}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4 py-2">
          <div className="space-y-2">
            <Label htmlFor="receiptUrl">Agreement Receipt URL</Label>
            <Input
              id="receiptUrl"
              type="url"
              placeholder="https://..."
              value={receiptUrl}
              onChange={(e) => {
                setReceiptUrl(e.target.value);
                if (error) setError(null);
              }}
              disabled={isLoading}
            />
            <p className="text-xs text-muted-foreground">
              Provide a direct URL to the signed business venture agreement receipt (Cloudinary or hosted PDF/image).
            </p>
            {error && <p className="text-xs text-destructive">{error}</p>}
          </div>

          <DialogFooter className="gap-2 sm:gap-0 pt-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={isLoading}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isLoading} className="gap-1.5">
              {isLoading ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Saving...
                </>
              ) : (
                <>
                  <Upload className="h-4 w-4" />
                  Save Receipt
                </>
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default UploadReceiptModal;
