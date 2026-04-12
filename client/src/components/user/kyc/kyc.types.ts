import { z } from "zod";
import type { UseFormReturn } from "react-hook-form";

// ─── Schema ───────────────────────────────────────────────────────────────────

export const kycSchema = z.object({
  dateOfBirth:          z.string().min(1, "Date of birth is required"),
  governmentIdType:     z.string().min(1, "ID type is required"),
  streetAddress:        z.string().min(3, "Street address is required"),
  city:                 z.string().min(1, "City is required"),
  stateRegion:          z.string().min(1, "State / Region is required"),
  countryCode:          z.string().length(2, "Select a country"),
  nextOfKinName:        z.string().min(2, "Next of kin name is required"),
  nextOfKinRelationship:z.string().min(1, "Relationship is required"),
  nextOfKinPhone:       z.string().min(7, "Valid phone number required"),
});

export type KycFormValues = z.infer<typeof kycSchema>;

// ─── Upload state ─────────────────────────────────────────────────────────────

export interface UploadState {
  file: File | null;
  url:  string | null;
  progress: number;
  uploading: boolean;
  error: string | null;
}

export const defaultUpload = (): UploadState => ({
  file: null,
  url:  null,
  progress: 0,
  uploading: false,
  error: null,
});

// ─── Steps ────────────────────────────────────────────────────────────────────

export const KYC_STEPS = [
  "Personal Info",
  "Address",
  "Documents",
  "Next of Kin",
  "Review",
] as const;

export type KycStep = (typeof KYC_STEPS)[number];

// ─── Shared prop types ────────────────────────────────────────────────────────

export type KycUploadType = "front" | "back" | "avatar";

export interface StepProps {
  form: UseFormReturn<KycFormValues>;
}

export interface DocumentsStepProps {
  uploads: Record<KycUploadType, UploadState>;
  onUpload: (type: KycUploadType, file: File) => Promise<void>;
}

export interface ReviewStepProps {
  form: UseFormReturn<KycFormValues>;
  uploads: Record<KycUploadType, UploadState>;
}