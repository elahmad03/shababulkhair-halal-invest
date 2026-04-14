"use client";

import { useState, useRef, useCallback, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Loader2, RefreshCw, Mail } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

import { useVerifyOtpMutation, useResendOtpMutation } from "@/store/modules/auth/authApi";
import type { OtpVerifyRequest, ResendOtpRequest } from "@/types";

interface VerifyOtpModalProps {
  isOpen: boolean;
  userId: string;
  email: string;
  onVerified: () => void;
  onClose: () => void;
}

// -------------------------
// OTP Input — 6 boxes
// -------------------------
function OtpInput({
  value,
  onChange,
  disabled,
}: {
  value: string[];
  onChange: (value: string[]) => void;
  disabled?: boolean;
}) {
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  const handleChange = (index: number, val: string) => {
    if (!/^\d*$/.test(val)) return;
    const newValue = [...value];
    newValue[index] = val.slice(-1);
    onChange(newValue);
    if (val && index < 5) inputRefs.current[index + 1]?.focus();
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent) => {
    if (e.key === "Backspace" && !value[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handlePaste = (e: React.ClipboardEvent) => {
    e.preventDefault();
    const pasted = e.clipboardData.getData("text").replace(/\D/g, "").slice(0, 6);
    const newValue = [...value].map((v, i) => pasted[i] || "");
    onChange(newValue);

    const nextIndex = pasted.length >= 6 ? 5 : pasted.length;
    inputRefs.current[nextIndex]?.focus();
  };

  return (
    <div className="flex gap-2 sm:gap-3 justify-center">
      {value.map((digit, i) => (
        <motion.input
          key={i}
          ref={(el) => {
            inputRefs.current[i] = el;
          }}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 + i * 0.05 }}
          type="text"
          inputMode="numeric"
          maxLength={1}
          value={digit}
          disabled={disabled}
          onChange={(e) => handleChange(i, e.target.value)}
          onKeyDown={(e) => handleKeyDown(i, e)}
          onPaste={handlePaste}
          className={`
            w-11 h-14 sm:w-12 sm:h-16 text-center text-xl font-bold rounded-xl border-2
            bg-background text-foreground transition-all duration-200 outline-none
            ${digit ? "border-primary shadow-sm shadow-primary/20" : "border-border"}
            focus:border-primary focus:shadow-sm focus:shadow-primary/20
            disabled:opacity-50 disabled:cursor-not-allowed
          `}
        />
      ))}
    </div>
  );
}

// -------------------------
// Countdown timer
// -------------------------
function ResendTimer({
  onResend,
  isResending,
}: {
  onResend: () => void;
  isResending: boolean;
}) {
  const [seconds, setSeconds] = useState(60);

  useEffect(() => {
    if (seconds <= 0) return;
    const timer = setTimeout(() => setSeconds((s) => s - 1), 1000);
    return () => clearTimeout(timer);
  }, [seconds]);

  const handleResend = () => {
    onResend();
    setSeconds(60);
  };

  return (
    <div className="text-center text-sm text-muted-foreground">
      {seconds > 0 ? (
        <span>
          Resend code in{" "}
          <span className="text-foreground font-medium tabular-nums">
            {String(Math.floor(seconds / 60)).padStart(2, "0")}:
            {String(seconds % 60).padStart(2, "0")}
          </span>
        </span>
      ) : (
        <button
          type="button"
          onClick={handleResend}
          disabled={isResending}
          className="flex items-center gap-1.5 mx-auto text-primary hover:underline underline-offset-4 font-medium disabled:opacity-50"
        >
          {isResending ? (
            <Loader2 className="w-3 h-3 animate-spin" />
          ) : (
            <RefreshCw className="w-3 h-3" />
          )}
          Resend code
        </button>
      )}
    </div>
  );
}

// -------------------------
// Modal Component
// -------------------------
export default function VerifyOtpModal({
  isOpen,
  userId,
  email,
  onVerified,
  onClose,
}: VerifyOtpModalProps) {
  const [otp, setOtp] = useState(["", "", "", "", "", ""]);
  const [serverError, setServerError] = useState<string | null>(null);

  const [verifyOtp, { isLoading }] = useVerifyOtpMutation();
  const [resendOtp, { isLoading: isResending }] = useResendOtpMutation();

  const otpValue = otp.join("");
  const isComplete = otpValue.length === 6;

  const handleVerify = useCallback(
    async (currentOtp?: string) => {
      const codeToVerify = currentOtp ?? otpValue;
      if (codeToVerify.length !== 6) return;

      setServerError(null);
      try {
        const payload: OtpVerifyRequest = { userId, otp: codeToVerify };
        await verifyOtp(payload).unwrap();
        onVerified();
      } catch (err: unknown) {
        const error = err as { data?: { message?: string } };
        setServerError(
          error?.data?.message ?? "Invalid or expired code. Please try again."
        );
        setOtp(["", "", "", "", "", ""]);
      }
    },
    [otpValue, userId, verifyOtp, onVerified]
  );

  const handleOtpChange = (newOtp: string[]) => {
    setOtp(newOtp);
    const combined = newOtp.join("");
    if (combined.length === 6) {
      handleVerify(combined);
    }
  };

  const handleResend = async () => {
    try {
      const payload: ResendOtpRequest = { email };
      await resendOtp(payload).unwrap();
      setServerError(null);
    } catch {
      setServerError("Failed to resend code. Please try again.");
    }
  };

  useEffect(() => {
    if (isOpen) {
      setTimeout(() => {
        setOtp(["", "", "", "", "", ""]);
        setServerError(null);
      }, 0);
    }
  }, [isOpen]);

  return (
    <Dialog 
      open={isOpen} 
      onOpenChange={(open) => {
        // Prevent closing the modal if a request is actively loading
        if (!open && !isLoading) onClose();
      }}
    >
      <DialogContent 
        className="w-full max-w-md p-6 sm:p-8"
        onInteractOutside={(e) => {
          if (isLoading) e.preventDefault();
        }}
        onEscapeKeyDown={(e) => {
          if (isLoading) e.preventDefault();
        }}
      >
        <DialogHeader className="space-y-2 text-center mb-4">
          <motion.div
            initial={{ scale: 0.5, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.1 }}
            className="flex justify-center mb-3"
          >
            <div className="p-3 bg-primary/10 rounded-full">
              <Mail className="w-6 h-6 text-primary" />
            </div>
          </motion.div>

          <DialogTitle asChild>
            <motion.h2
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.15 }}
              className="text-2xl font-bold text-center"
            >
              Verify your email
            </motion.h2>
          </DialogTitle>

          <DialogDescription asChild>
            <motion.p
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="text-center"
            >
              Enter the 6-digit code sent to <span className="font-medium text-foreground">{email}</span>
            </motion.p>
          </DialogDescription>
        </DialogHeader>

        {/* Error message */}
        <AnimatePresence mode="wait">
          {serverError && (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="mb-4 px-4 py-3 rounded-lg bg-destructive/10 border border-destructive/20 text-destructive text-sm font-medium"
            >
              {serverError}
            </motion.div>
          )}
        </AnimatePresence>

        {/* OTP input */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.25 }}
          className="mb-6"
        >
          <OtpInput
            value={otp}
            onChange={handleOtpChange}
            disabled={isLoading}
          />
        </motion.div>

        {/* Resend timer */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="mb-6"
        >
          <ResendTimer onResend={handleResend} isResending={isResending} />
        </motion.div>

        {/* Manual verify button */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.35 }}
        >
          <Button
            type="button"
            onClick={() => handleVerify()}
            disabled={isLoading || !isComplete}
            className="w-full h-11 text-base font-semibold"
          >
            {isLoading ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              "Verify"
            )}
          </Button>
        </motion.div>
      </DialogContent>
    </Dialog>
  );
}