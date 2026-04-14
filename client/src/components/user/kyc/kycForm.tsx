"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Form } from "@/components/ui/form";

import {
  useLazyGetUploadSignatureQuery,
  useSubmitKycMutation,
} from "@/store/modules/kyc/kycApi";
import { uploadToCloudinary } from "@/lib/cloudinaryUpload";

import {
  kycSchema,
  defaultUpload,
  KYC_STEPS,
  type KycFormValues,
  type KycUploadType,
  type UploadState,
} from "./kyc.types";
import { KycStepHeader }   from "./kycStepHeader";
import { PersonalInfoStep } from "./personalInfoStep";
import { AddressStep }      from "./AddressStep";
import { DocumentsStep }    from "./DocumentStep";
import { NextOfKinStep }    from "./NextOfkinStep";
import { ReviewStep }       from "./ReviewStep";

export function KycForm() {
  const router = useRouter();
  const [step, setStep] = useState(0);
  const [uploads, setUploads] = useState<Record<KycUploadType, UploadState>>({
    front:  defaultUpload(),
    back:   defaultUpload(),
    avatar: defaultUpload(),
  });

  const [getSignature]                           = useLazyGetUploadSignatureQuery();
  const [submitKyc, { isLoading: isSubmitting }] = useSubmitKycMutation();

  const form = useForm<KycFormValues>({
    resolver: zodResolver(kycSchema),
    defaultValues: {
      dateOfBirth: "",
      governmentIdType: "",
      streetAddress: "",
      city: "",
      stateRegion: "",
      countryCode: "",
      nextOfKinName: "",
      nextOfKinRelationship: "",
      nextOfKinPhone: "",
    },
  });

  // ── Upload ──────────────────────────────────────────────────────────────────

  const handleUpload = async (type: KycUploadType, file: File) => {
    const allowed = ["image/jpeg", "image/png", "application/pdf"];
    if (!allowed.includes(file.type)) {
      setUploads((prev) => ({
        ...prev,
        [type]: { ...prev[type], error: "Only JPG, PNG or PDF files are allowed" },
      }));
      return;
    }

    setUploads((prev) => ({
      ...prev,
      [type]: { ...defaultUpload(), file, uploading: true },
    }));

    try {
      const sigResult = await getSignature(type).unwrap();

      const result = await uploadToCloudinary(
        file,
        sigResult.data,
        (progress) => {
          setUploads((prev) => ({
            ...prev,
            [type]: { ...prev[type], progress },
          }));
        }
      );

      setUploads((prev) => ({
        ...prev,
        [type]: {
          ...prev[type],
          url: result.secure_url,
          uploading: false,
          progress: 100,
          error: null,
        },
      }));
    } catch (err: any) {
      const message = err.message ?? "Upload failed. Please try again.";
      setUploads((prev) => ({
        ...prev,
        [type]: { ...prev[type], uploading: false, error: message },
      }));
      toast.error("Upload failed", { description: message });
    }
  };

  // ── Navigation ──────────────────────────────────────────────────────────────

  const fieldsByStep: Record<number, (keyof KycFormValues)[]> = {
    0: ["dateOfBirth", "governmentIdType"],
    1: ["streetAddress", "city", "stateRegion", "countryCode"],
    3: ["nextOfKinName", "nextOfKinRelationship", "nextOfKinPhone"],
  };

  const handleNext = async () => {
    if (step === 2) {
      const missing = (["front", "back", "avatar"] as KycUploadType[]).filter(
        (t) => !uploads[t].url
      );
      if (missing.length > 0) {
        toast.error("Please upload all 3 documents before continuing.");
        return;
      }
      setStep((s) => s + 1);
      return;
    }

    const fields = fieldsByStep[step] ?? [];
    const valid = await form.trigger(fields);
    if (valid) setStep((s) => s + 1);
  };

  const handleBack = () => setStep((s) => s - 1);

  // ── Submit ──────────────────────────────────────────────────────────────────

  const onSubmit = async (values: KycFormValues) => {
    if (!uploads.front.url || !uploads.back.url || !uploads.avatar.url) {
      toast.error("Documents missing", {
        description: "Please go back and upload all required documents.",
      });
      return;
    }

    try {
      await submitKyc({
        ...values,
        idCardFrontUrl: uploads.front.url,
        idCardBackUrl:  uploads.back.url,
        avatarUrl:      uploads.avatar.url,
      }).unwrap();

      toast.success("KYC submitted successfully!", {
        description: "Your application is under review.",
      });

      // ✅ Redirect to dashboard after successful submission
      router.push("/dashboard");
    } catch (err: any) {
      toast.error("Submission failed", {
        description: err?.data?.message ?? "Please try again.",
      });
    }
  };

  // ── Render ──────────────────────────────────────────────────────────────────

  const isLastStep = step === KYC_STEPS.length - 1;

  const stepContent = [
    <PersonalInfoStep key="personal" form={form} />,
    <AddressStep      key="address"  form={form} />,
    <DocumentsStep    key="docs"     uploads={uploads} onUpload={handleUpload} />,
    <NextOfKinStep    key="kin"      form={form} />,
    <ReviewStep       key="review"   form={form} uploads={uploads} />,
  ];

  return (
    <div className="space-y-6">
      <KycStepHeader step={step} />

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          {stepContent[step]}

          <div className="flex gap-3 pt-2">
            {step > 0 && (
              <Button
                type="button"
                variant="outline"
                onClick={handleBack}
                className="flex-1"
                disabled={isSubmitting}
              >
                Back
              </Button>
            )}

            {isLastStep ? (
              <Button type="submit" className="flex-1" disabled={isSubmitting}>
                {isSubmitting ? (
                  <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Submitting…</>
                ) : (
                  "Submit KYC"
                )}
              </Button>
            ) : (
              <Button
                type="button"
                className="flex-1"
                onClick={handleNext}
                disabled={isSubmitting}
              >
                Continue
              </Button>
            )}
          </div>
        </form>
      </Form>
    </div>
  );
}