"use client";

import { useState, useRef, useCallback, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { motion, AnimatePresence } from "motion/react";
import { Loader2, ArrowLeft, RefreshCw, MailOpen } from "lucide-react";
import { toast } from "sonner"; // Using shadcn's default modern toast

import { Button } from "@/components/ui/button";
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardFooter, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card";

import { useVerifyOtpMutation, useResendOtpMutation } from "@/store/modules/auth/authApi";
import type { OtpVerifyRequest, ResendOtpRequest } from "@/types";

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
    // Backspace to previous
    if (e.key === "Backspace" && !value[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
    // Arrow Left to previous
    if (e.key === "ArrowLeft" && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
    // Arrow Right to next
    if (e.key === "ArrowRight" && index < 5) {
      inputRefs.current[index + 1]?.focus();
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
          ref={(el) => { inputRefs.current[i] = el; }}
          autoFocus={i === 0}
          aria-label={`Digit ${i + 1} of 6`}
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
            w-11 h-14 sm:w-12 sm:h-16 text-center text-xl font-bold rounded-xl
            flex border bg-background ring-offset-background transition-all duration-200
            focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2
            disabled:cursor-not-allowed disabled:opacity-50
            ${digit ? "border-primary shadow-sm shadow-primary/10" : "border-input"}
          `}
        />
      ))}
    </div>
  );
}

// -------------------------
// Countdown timer
// -------------------------
function ResendTimer({ onResend, isResending }: { onResend: () => Promise<boolean>; isResending: boolean }) {
  const [seconds, setSeconds] = useState(60);

  useEffect(() => {
    if (seconds <= 0) return;
    const timer = setTimeout(() => setSeconds((s) => s - 1), 1000);
    return () => clearTimeout(timer);
  }, [seconds]);

  const handleResend = async () => { 
    const success = await onResend(); 
    // Only reset the timer if the API call was successful
    if (success) {
      setSeconds(60); 
    }
  };

  return (
    <div className="text-center text-sm text-muted-foreground w-full">
      {seconds > 0 ? (
        <span>
          Resend code in{" "}
          <span className="text-foreground font-medium tabular-nums">
            {String(Math.floor(seconds / 60)).padStart(2, "0")}:{String(seconds % 60).padStart(2, "0")}
          </span>
        </span>
      ) : (
        <Button
          variant="link"
          onClick={handleResend}
          disabled={isResending}
          className="mx-auto"
        >
          {isResending ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <RefreshCw className="w-4 h-4 mr-2" />}
          Resend code
        </Button>
      )}
    </div>
  );
}

// -------------------------
// Page
// -------------------------
export default function VerifyOtpPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const userId = searchParams.get("userId");
  const email = searchParams.get("email");

  const [otp, setOtp] = useState(["", "", "", "", "", ""]);
  const [serverError, setServerError] = useState<string | null>(null);

  const [verifyOtp, { isLoading }] = useVerifyOtpMutation();
  const [resendOtp, { isLoading: isResending }] = useResendOtpMutation();

  // Edge Case: Redirect if user somehow lands here without URL params
  useEffect(() => {
    if (!userId || !email) {
      router.replace("/login"); 
    }
  }, [userId, email, router]);

  // Return null briefly to prevent flash of empty state while redirecting
  if (!userId || !email) return null;

  const otpValue = otp.join("");
  const isComplete = otpValue.length === 6;

  const handleVerify = useCallback(async (currentOtp?: string) => {
    const codeToVerify = currentOtp ?? otpValue;
    if (codeToVerify.length !== 6) return;

    setServerError(null);
    try {
      const payload: OtpVerifyRequest = { userId, otp: codeToVerify };
      await verifyOtp(payload).unwrap();
      toast.success("Email verified successfully!");
      router.push("/dashboard");
    } catch (err: unknown) {
      const error = err as { data?: { message?: string } };
      setServerError(error?.data?.message ?? "Invalid or expired code. Please try again.");
      // Notice: We intentionally do NOT wipe the OTP here anymore.
    }
  }, [otpValue, userId, verifyOtp, router]);

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
      toast.success("New verification code sent!");
      return true;
    } catch {
      toast.error("Failed to resend code. Please try again.");
      return false;
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
      className="max-w-md w-full mx-auto"
    >
      <Button
        variant="ghost"
        size="sm"
        onClick={() => router.back()}
        className="mb-6 text-muted-foreground hover:text-foreground"
      >
        <ArrowLeft className="w-4 h-4 mr-2" />
        Back
      </Button>

      <Card className="border-0 shadow-none sm:border sm:shadow-sm">
        <CardHeader className="text-center space-y-4">
          <motion.div
            initial={{ scale: 0.5, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.1, type: "spring", stiffness: 200 }}
            className="w-16 h-16 rounded-2xl bg-primary/10 border border-primary/20 flex items-center justify-center mx-auto"
          >
            <MailOpen className="w-8 h-8 text-primary" />
          </motion.div>
          
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15 }}
          >
            <CardTitle className="text-3xl font-bold tracking-tight">
              Check your email
            </CardTitle>
          </motion.div>
          
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <CardDescription className="text-base">
              We sent a 6-digit code to{" "}
              <span className="text-foreground font-medium">{email}</span>
            </CardDescription>
          </motion.div>
        </CardHeader>

        <CardContent className="space-y-4 pt-4">
          <OtpInput 
            value={otp} 
            onChange={handleOtpChange} 
            disabled={isLoading} 
          />
          
          <AnimatePresence mode="wait">
            {serverError && (
              <motion.p
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                className="text-center text-sm text-destructive font-medium"
              >
                {serverError}
              </motion.p>
            )}
          </AnimatePresence>
        </CardContent>

        <CardFooter className="flex flex-col gap-6 pt-4">
          <motion.div 
            initial={{ opacity: 0, y: 10 }} 
            animate={{ opacity: 1, y: 0 }} 
            transition={{ delay: 0.5 }}
            className="w-full"
          >
            <Button
              size="lg"
              onClick={() => handleVerify()}
              className="w-full font-semibold"
              disabled={!isComplete || isLoading}
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Verifying...
                </>
              ) : (
                "Verify Email"
              )}
            </Button>
          </motion.div>

          <ResendTimer onResend={handleResend} isResending={isResending} />
        </CardFooter>
      </Card>
    </motion.div>
  );
}