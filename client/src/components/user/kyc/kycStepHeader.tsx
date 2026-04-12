"use client";

import { Progress } from "@/components/ui/progress";
import { KYC_STEPS } from "./kyc.types";

interface KycStepHeaderProps {
  step: number;
}

export function KycStepHeader({ step }: KycStepHeaderProps) {
  return (
    <div className="space-y-4">
      {/* Title row */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Identity Verification</h1>
          <p className="text-sm text-muted-foreground mt-0.5">
            Complete all steps to verify your account.
          </p>
        </div>
        <span className="text-xs text-muted-foreground tabular-nums">
          {step + 1} / {KYC_STEPS.length}
        </span>
      </div>

      {/* Progress bar */}
      <Progress
        value={((step + 1) / KYC_STEPS.length) * 100}
        className="h-1.5"
      />

      {/* Step pills */}
      <div className="flex gap-1.5">
        {KYC_STEPS.map((label, i) => (
          <div
            key={label}
            title={label}
            className={`h-1 flex-1 rounded-full transition-colors duration-300 ${
              i <= step ? "bg-primary" : "bg-muted"
            }`}
          />
        ))}
      </div>

      {/* Current step label */}
      <p className="text-sm font-medium">{KYC_STEPS[step]}</p>
    </div>
  );
}