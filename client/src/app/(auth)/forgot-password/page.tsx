"use client";

import { useState, useRef, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { motion, AnimatePresence } from "motion/react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import {
  KeyRound,
  Mail,
  Eye,
  EyeOff,
  ArrowLeft,
  ArrowRight,
  Loader2,
  RefreshCw,
  CheckCircle2,
  AlertCircle,
  Lock,
} from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";

import {
  useForgotPasswordMutation,
  useResetPasswordMutation,
} from "@/store/modules/auth/authApi";
import type { ApiError, ForgotPasswordRequest, ResetPasswordRequest } from "@/types";

// ============================================================
// SCHEMAS
// ============================================================

const requestOtpSchema = z.object({
  email: z.string().email("Enter a valid email address"),
});

type RequestOtpForm = z.infer<typeof requestOtpSchema>;

const resetPasswordFormSchema = z
  .object({
    password: z.string().min(8, "Password must be at least 8 characters"),
    confirmPassword: z.string().min(1, "Please confirm your password"),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });

type ResetPasswordFormData = z.infer<typeof resetPasswordFormSchema>;

// ============================================================
// OTP INPUT (6 boxes)
// ============================================================

function OtpBoxes({
  value,
  onChange,
  disabled,
}: {
  value: string[];
  onChange: (val: string[]) => void;
  disabled?: boolean;
}) {
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  const handleChange = (index: number, val: string) => {
    if (!/^\d*$/.test(val)) return;
    const next = [...value];
    next[index] = val.slice(-1);
    onChange(next);
    if (val && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent) => {
    if (e.key === "Backspace" && !value[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
    if (e.key === "ArrowLeft" && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
    if (e.key === "ArrowRight" && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handlePaste = (e: React.ClipboardEvent) => {
    e.preventDefault();
    const pasted = e.clipboardData.getData("text").replace(/\D/g, "").slice(0, 6);
    const next = [...value].map((_, i) => pasted[i] || "");
    onChange(next);
    const focusIdx = pasted.length >= 6 ? 5 : pasted.length;
    inputRefs.current[focusIdx]?.focus();
  };

  return (
    <div className="flex gap-2 sm:gap-3 justify-center">
      {value.map((digit, i) => (
        <input
          key={i}
          ref={(el) => {
            inputRefs.current[i] = el;
          }}
          type="text"
          inputMode="numeric"
          maxLength={1}
          autoFocus={i === 0}
          aria-label={`Digit ${i + 1} of 6`}
          value={digit}
          disabled={disabled}
          onChange={(e) => handleChange(i, e.target.value)}
          onKeyDown={(e) => handleKeyDown(i, e)}
          onPaste={handlePaste}
          className={`
            w-11 h-14 sm:w-12 sm:h-16 text-center text-xl font-bold rounded-xl border
            bg-background text-foreground ring-offset-background transition-all duration-200
            focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2
            disabled:opacity-50 disabled:cursor-not-allowed
            ${digit ? "border-primary shadow-sm shadow-primary/10" : "border-input"}
          `}
        />
      ))}
    </div>
  );
}

// ============================================================
// RESEND TIMER
// ============================================================

function ResendTimer({
  onResend,
  isResending,
}: {
  onResend: () => Promise<void>;
  isResending: boolean;
}) {
  const [seconds, setSeconds] = useState(60);

  useEffect(() => {
    if (seconds <= 0) return;
    const timer = setTimeout(() => setSeconds((s) => s - 1), 1000);
    return () => clearTimeout(timer);
  }, [seconds]);

  const handleResend = async () => {
    await onResend();
    setSeconds(60);
  };

  return (
    <div className="text-center text-sm text-muted-foreground w-full">
      {seconds > 0 ? (
        <span>
          Resend code in{" "}
          <span className="text-foreground font-medium tabular-nums">
            {String(Math.floor(seconds / 60)).padStart(2, "0")}:
            {String(seconds % 60).padStart(2, "0")}
          </span>
        </span>
      ) : (
        <Button
          type="button"
          variant="link"
          size="sm"
          onClick={handleResend}
          disabled={isResending}
          className="mx-auto text-primary"
        >
          {isResending ? (
            <Loader2 className="w-4 h-4 mr-1.5 animate-spin" />
          ) : (
            <RefreshCw className="w-4 h-4 mr-1.5" />
          )}
          Resend verification code
        </Button>
      )}
    </div>
  );
}

// ============================================================
// MAIN FORGOT PASSWORD CONTENT
// ============================================================

function ForgotPasswordContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const initialEmail = searchParams.get("email") || "";

  // Step 1: "request" | Step 2: "reset" | Step 3: "success"
  const [step, setStep] = useState<"request" | "reset" | "success">(
    initialEmail ? "reset" : "request"
  );
  const [email, setEmail] = useState(initialEmail);
  const [otp, setOtp] = useState(["", "", "", "", "", ""]);
  const [serverError, setServerError] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const [forgotPassword, { isLoading: isRequesting }] = useForgotPasswordMutation();
  const [resetPassword, { isLoading: isResetting }] = useResetPasswordMutation();

  // Form for Step 1
  const requestForm = useForm<RequestOtpForm>({
    resolver: zodResolver(requestOtpSchema),
    defaultValues: { email: initialEmail },
  });

  // Form for Step 2
  const resetForm = useForm<ResetPasswordFormData>({
    resolver: zodResolver(resetPasswordFormSchema),
    defaultValues: { password: "", confirmPassword: "" },
  });

  // -------------------------
  // Handlers
  // -------------------------

  const handleRequestOtp = async (values: RequestOtpForm) => {
    setServerError(null);
    try {
      const payload: ForgotPasswordRequest = { email: values.email.trim().toLowerCase() };
      await forgotPassword(payload).unwrap();
      setEmail(values.email.trim().toLowerCase());
      setStep("reset");
      toast.success("Verification code sent if your email is registered.");
    } catch (err: unknown) {
      const error = err as ApiError;
      setServerError(
        error.data?.message ?? "Failed to send reset code. Please try again."
      );
    }
  };

  const handleResendOtp = async () => {
    setServerError(null);
    try {
      const payload: ForgotPasswordRequest = { email };
      await forgotPassword(payload).unwrap();
      toast.success("New verification code sent!");
    } catch (err: unknown) {
      const error = err as ApiError;
      setServerError(
        error.data?.message ?? "Failed to resend code. Please try again."
      );
    }
  };

  const handleResetPassword = async (values: ResetPasswordFormData) => {
    const otpCode = otp.join("");
    if (otpCode.length !== 6) {
      setServerError("Please enter the full 6-digit verification code");
      return;
    }

    setServerError(null);
    try {
      const payload: ResetPasswordRequest = {
        email,
        otp: otpCode,
        newPassword: values.password,
      };

      await resetPassword(payload).unwrap();
      setStep("success");
      toast.success("Password reset successfully!");
      setTimeout(() => {
        router.push("/sign-in");
      }, 2000);
    } catch (err: unknown) {
      const error = err as ApiError;
      setServerError(
        error.data?.message ?? "Invalid or expired code. Please try again."
      );
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
      className="max-w-md w-full mx-auto"
    >
      <Card className="border-0 shadow-none sm:border sm:shadow-sm">
        <AnimatePresence mode="wait">
          {/* ======================================================== */}
          {/* STEP 1: REQUEST OTP                                      */}
          {/* ======================================================== */}
          {step === "request" && (
            <motion.div
              key="step-request"
              initial={{ opacity: 0, x: -16 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 16 }}
              transition={{ duration: 0.3 }}
            >
              <CardHeader className="space-y-3">
                <div className="w-12 h-12 rounded-2xl bg-primary/10 border border-primary/20 flex items-center justify-center text-primary">
                  <KeyRound className="w-6 h-6" />
                </div>
                <div>
                  <CardTitle className="text-3xl font-bold tracking-tight">
                    Forgot password?
                  </CardTitle>
                  <CardDescription className="text-base text-muted-foreground mt-1">
                    No worries. Enter your email and we will send you a 6-digit code to reset your password.
                  </CardDescription>
                </div>
              </CardHeader>

              <CardContent className="space-y-5">
                <AnimatePresence mode="wait">
                  {serverError && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: "auto" }}
                      exit={{ opacity: 0, height: 0 }}
                      className="overflow-hidden"
                    >
                      <Alert variant="destructive" className="bg-destructive/10 border-destructive/20">
                        <AlertCircle className="h-4 w-4" />
                        <AlertDescription>{serverError}</AlertDescription>
                      </Alert>
                    </motion.div>
                  )}
                </AnimatePresence>

                <Form {...requestForm}>
                  <form onSubmit={requestForm.handleSubmit(handleRequestOtp)} className="space-y-5">
                    <FormField
                      control={requestForm.control}
                      name="email"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Email Address</FormLabel>
                          <FormControl>
                            <Input
                              type="email"
                              placeholder="name@example.com"
                              disabled={isRequesting}
                              autoFocus
                              autoComplete="email"
                              {...field}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <Button
                      type="submit"
                      size="lg"
                      className="w-full font-semibold group"
                      disabled={isRequesting}
                    >
                      {isRequesting ? (
                        <>
                          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                          Sending code...
                        </>
                      ) : (
                        <>
                          Send Reset Code
                          <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
                        </>
                      )}
                    </Button>
                  </form>
                </Form>
              </CardContent>

              <CardFooter className="flex justify-center border-t bg-muted/30 py-5 px-6 sm:rounded-b-lg">
                <Link
                  href="/sign-in"
                  className="inline-flex items-center text-sm font-semibold text-muted-foreground hover:text-foreground transition-colors"
                >
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Back to Sign In
                </Link>
              </CardFooter>
            </motion.div>
          )}

          {/* ======================================================== */}
          {/* STEP 2: VERIFY OTP & RESET PASSWORD                      */}
          {/* ======================================================== */}
          {step === "reset" && (
            <motion.div
              key="step-reset"
              initial={{ opacity: 0, x: 16 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -16 }}
              transition={{ duration: 0.3 }}
            >
              <CardHeader className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="w-12 h-12 rounded-2xl bg-primary/10 border border-primary/20 flex items-center justify-center text-primary">
                    <Lock className="w-6 h-6" />
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => {
                      setServerError(null);
                      setStep("request");
                    }}
                    className="text-xs text-muted-foreground hover:text-foreground"
                  >
                    Change email
                  </Button>
                </div>
                <div>
                  <CardTitle className="text-3xl font-bold tracking-tight">
                    Reset password
                  </CardTitle>
                  <CardDescription className="text-base text-muted-foreground mt-1">
                    Enter the 6-digit code sent to{" "}
                    <span className="font-medium text-foreground">{email}</span> and your new password.
                  </CardDescription>
                </div>
              </CardHeader>

              <CardContent className="space-y-6">
                <AnimatePresence mode="wait">
                  {serverError && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: "auto" }}
                      exit={{ opacity: 0, height: 0 }}
                      className="overflow-hidden"
                    >
                      <Alert variant="destructive" className="bg-destructive/10 border-destructive/20">
                        <AlertCircle className="h-4 w-4" />
                        <AlertDescription>{serverError}</AlertDescription>
                      </Alert>
                    </motion.div>
                  )}
                </AnimatePresence>

                {/* OTP Input Section */}
                <div className="space-y-2">
                  <Label className="block text-center text-sm font-medium">
                    Verification Code
                  </Label>
                  <OtpBoxes
                    value={otp}
                    onChange={(val) => {
                      setOtp(val);
                      if (serverError) setServerError(null);
                    }}
                    disabled={isResetting}
                  />
                  <div className="pt-2">
                    <ResendTimer onResend={handleResendOtp} isResending={isRequesting} />
                  </div>
                </div>

                {/* New Password Form */}
                <Form {...resetForm}>
                  <form onSubmit={resetForm.handleSubmit(handleResetPassword)} className="space-y-4">
                    <FormField
                      control={resetForm.control}
                      name="password"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>New Password</FormLabel>
                          <FormControl>
                            <div className="relative">
                              <Input
                                type={showPassword ? "text" : "password"}
                                placeholder="At least 8 characters"
                                disabled={isResetting}
                                autoComplete="new-password"
                                className="pr-10"
                                {...field}
                              />
                              <button
                                type="button"
                                onClick={() => setShowPassword((v) => !v)}
                                disabled={isResetting}
                                aria-label={showPassword ? "Hide password" : "Show password"}
                                className="absolute right-1 top-1/2 -translate-y-1/2 p-2 text-muted-foreground hover:text-foreground rounded-md transition-colors"
                              >
                                {showPassword ? (
                                  <EyeOff className="w-4 h-4" />
                                ) : (
                                  <Eye className="w-4 h-4" />
                                )}
                              </button>
                            </div>
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={resetForm.control}
                      name="confirmPassword"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Confirm New Password</FormLabel>
                          <FormControl>
                            <div className="relative">
                              <Input
                                type={showConfirmPassword ? "text" : "password"}
                                placeholder="Re-enter your new password"
                                disabled={isResetting}
                                autoComplete="new-password"
                                className="pr-10"
                                {...field}
                              />
                              <button
                                type="button"
                                onClick={() => setShowConfirmPassword((v) => !v)}
                                disabled={isResetting}
                                aria-label={showConfirmPassword ? "Hide password" : "Show password"}
                                className="absolute right-1 top-1/2 -translate-y-1/2 p-2 text-muted-foreground hover:text-foreground rounded-md transition-colors"
                              >
                                {showConfirmPassword ? (
                                  <EyeOff className="w-4 h-4" />
                                ) : (
                                  <Eye className="w-4 h-4" />
                                )}
                              </button>
                            </div>
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <Button
                      type="submit"
                      size="lg"
                      className="w-full font-semibold mt-2"
                      disabled={isResetting || otp.join("").length !== 6}
                    >
                      {isResetting ? (
                        <>
                          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                          Resetting password...
                        </>
                      ) : (
                        "Reset Password"
                      )}
                    </Button>
                  </form>
                </Form>
              </CardContent>

              <CardFooter className="flex justify-center border-t bg-muted/30 py-5 px-6 sm:rounded-b-lg">
                <Link
                  href="/sign-in"
                  className="inline-flex items-center text-sm font-semibold text-muted-foreground hover:text-foreground transition-colors"
                >
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Cancel and Sign In
                </Link>
              </CardFooter>
            </motion.div>
          )}

          {/* ======================================================== */}
          {/* STEP 3: SUCCESS STATE                                    */}
          {/* ======================================================== */}
          {step === "success" && (
            <motion.div
              key="step-success"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.4 }}
              className="p-8 text-center space-y-4"
            >
              <div className="w-16 h-16 rounded-full bg-primary/10 border border-primary/20 flex items-center justify-center mx-auto text-primary">
                <CheckCircle2 className="w-8 h-8" />
              </div>
              <CardTitle className="text-2xl font-bold tracking-tight">
                Password reset complete!
              </CardTitle>
              <CardDescription className="text-base text-muted-foreground">
                Your password has been securely updated. You will be redirected to the sign-in page shortly.
              </CardDescription>

              <div className="pt-4">
                <Button
                  onClick={() => router.push("/sign-in")}
                  className="w-full font-semibold"
                >
                  Sign In Now
                </Button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </Card>
    </motion.div>
  );
}

// ============================================================
// EXPORT DEFAULT WITH SUSPENSE BOUNDARY
// ============================================================

export default function ForgotPasswordPage() {
  return (
    <Suspense
      fallback={
        <div className="flex items-center justify-center py-20 text-muted-foreground">
          <Loader2 className="w-6 h-6 animate-spin mr-2" />
          Loading...
        </div>
      }
    >
      <ForgotPasswordContent />
    </Suspense>
  );
}

