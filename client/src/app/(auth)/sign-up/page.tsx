"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { motion, AnimatePresence, Variants } from "motion/react";
import { useForm, useWatch, Control } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Eye, EyeOff, Loader2, CheckCircle2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";

import TermsModal from "@/components/auth/TermsModal";
import VerifyOtpModal from "@/components/auth/VerifyOtpModal";

import { useRegisterMutation } from "@/store/modules/auth/authApi";
import type { RegisterRequest } from "@/types";

// ─── Schema ──────────────────────────────────────────────────────────────────
const registerSchema = z
  .object({
    firstName: z.string().min(2, "First name must be at least 2 characters"),
    lastName: z.string().min(2, "Last name must be at least 2 characters"),
    email: z.string().email("Enter a valid email address"),
    phoneNumber: z.string().min(7, "Enter a valid phone number"),
    password: z
      .string()
      .min(8, "Password must be at least 8 characters")
      .regex(/[A-Z]/, "Must contain an uppercase letter")
      .regex(/[0-9]/, "Must contain a number"),
    confirmPassword: z.string(),
    termsAccepted: z
      .boolean()
      .refine((v) => v === true, { message: "You must accept the Terms and Conditions" }),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });

type RegisterForm = z.infer<typeof registerSchema>;

// ─── Animation variants ───────────────────────────────────────────────────────
const staggerContainer: Variants = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.08 } },
};
const slideUp: Variants = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 300, damping: 24 } },
};
const popIn: Variants = {
  hidden: { opacity: 0, scale: 0.8 },
  show: { opacity: 1, scale: 1, transition: { type: "spring", stiffness: 400, damping: 20 } },
};

// ─── Password strength ────────────────────────────────────────────────────────
function PasswordStrength({ control }: { control: Control<RegisterForm> }) {
  const password = useWatch({ control, name: "password", defaultValue: "" });
  const checks = [
    { label: "8+ characters", pass: password.length >= 8 },
    { label: "Uppercase letter", pass: /[A-Z]/.test(password) },
    { label: "Number", pass: /[0-9]/.test(password) },
  ];
  const strength = checks.filter((c) => c.pass).length;
  const getColor = (i: number) => {
    if (i >= strength) return "hsl(var(--muted))";
    if (strength === 1) return "#ef4444";
    if (strength === 2) return "#eab308";
    return "#22c55e";
  };
  return (
    <AnimatePresence>
      {password && (
        <motion.div
          layout
          initial={{ opacity: 0, height: 0, marginTop: 0 }}
          animate={{ opacity: 1, height: "auto", marginTop: 8 }}
          exit={{ opacity: 0, height: 0, marginTop: 0 }}
          className="space-y-3 overflow-hidden"
        >
          <div className="flex gap-1.5">
            {[0, 1, 2].map((i) => (
              <motion.div
                key={i}
                layout
                initial={false}
                animate={{ backgroundColor: getColor(i) }}
                transition={{ duration: 0.3 }}
                className="h-1.5 flex-1 rounded-full"
              />
            ))}
          </div>
          <motion.div variants={staggerContainer} initial="hidden" animate="show" className="flex gap-3 flex-wrap">
            {checks.map((check) => (
              <motion.span
                variants={popIn}
                key={check.label}
                layout
                className={`text-xs flex items-center gap-1.5 transition-colors duration-300 ${
                  check.pass ? "text-foreground" : "text-muted-foreground"
                }`}
              >
                <motion.div initial={false} animate={{ scale: check.pass ? [1, 1.2, 1] : 1 }} transition={{ duration: 0.3 }}>
                  <CheckCircle2
                    className={`w-3.5 h-3.5 transition-colors duration-300 ${
                      check.pass ? "text-primary" : "text-muted-foreground/50"
                    }`}
                  />
                </motion.div>
                {check.label}
              </motion.span>
            ))}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────
export default function SignUpPage() {
  const router = useRouter();
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);
  const [showTermsModal, setShowTermsModal] = useState(false);
  const [verificationState, setVerificationState] = useState<{ userId: string; email: string } | null>(null);
  const [showOtpModal, setShowOtpModal] = useState(false);

  const [register, { isLoading }] = useRegisterMutation();

  const form = useForm<RegisterForm>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      firstName: "",
      lastName: "",
      email: "",
      phoneNumber: "",
      password: "",
      confirmPassword: "",
      termsAccepted: false,
    },
  });

  const termsAccepted = form.watch("termsAccepted");

  const onSubmit = async (values: RegisterForm) => {
    setServerError(null);
    try {
      const payload: RegisterRequest = {
        firstName: values.firstName,
        lastName: values.lastName,
        email: values.email,
        phoneNumber: values.phoneNumber,
        password: values.password,
        termsAccepted: values.termsAccepted,
      };
      const res = await register(payload).unwrap();
      // Show OTP verification modal immediately after successful registration
      setVerificationState({ userId: res.data.userId, email: values.email });
      setShowOtpModal(true);
    } catch (err: unknown) {
      const error = err as { data?: { message?: string } };
      setServerError(error?.data?.message ?? "Something went wrong. Please try again.");
    }
  };

  const handleOtpVerified = () => {
    setShowOtpModal(false);
    setVerificationState(null);
    router.push("/user/dashboard");
  };

  return (
    <motion.div layout className="space-y-8">
      {/* Heading */}
      <motion.div variants={slideUp} initial="hidden" animate="show" className="space-y-2">
        <h2 className="text-3xl font-bold text-foreground tracking-tight">Create your account</h2>
        <p className="text-muted-foreground text-sm">Join us today for Halal investment.</p>
      </motion.div>

      {/* Server error */}
      <AnimatePresence mode="popLayout">
        {serverError && (
          <motion.div
            layout
            initial={{ opacity: 0, scale: 0.95, y: -20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: -20 }}
            transition={{ type: "spring", stiffness: 300, damping: 25 }}
            className="px-4 py-3 rounded-lg bg-destructive/10 border border-destructive/20 text-destructive text-sm font-medium"
          >
            {serverError}
          </motion.div>
        )}
      </AnimatePresence>

      <Form {...form}>
        <motion.form
          layout
          variants={staggerContainer}
          initial="hidden"
          animate="show"
          onSubmit={form.handleSubmit(onSubmit)}
          className="space-y-5"
        >
          {/* Name row */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <motion.div variants={slideUp} layout>
              <FormField
                control={form.control}
                name="firstName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>First Name</FormLabel>
                    <FormControl>
                      <Input placeholder="" disabled={isLoading} {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </motion.div>
            <motion.div variants={slideUp} layout>
              <FormField
                control={form.control}
                name="lastName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Last Name</FormLabel>
                    <FormControl>
                      <Input placeholder="" disabled={isLoading} {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </motion.div>
          </div>

          {/* Email */}
          <motion.div variants={slideUp} layout>
            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Email Address</FormLabel>
                  <FormControl>
                    <Input type="email" placeholder="" disabled={isLoading} autoComplete="email" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </motion.div>

          {/* Phone */}
          <motion.div variants={slideUp} layout>
            <FormField
              control={form.control}
              name="phoneNumber"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Phone Number</FormLabel>
                  <FormControl>
                    <Input type="tel" placeholder="" disabled={isLoading} {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </motion.div>

          {/* Password */}
          <motion.div variants={slideUp} layout>
            <FormField
              control={form.control}
              name="password"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Password</FormLabel>
                  <FormControl>
                    <div className="relative">
                      <Input
                        type={showPassword ? "text" : "password"}
                        placeholder=""
                        className="pr-10"
                        disabled={isLoading}
                        autoComplete="new-password"
                        {...field}
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword((v) => !v)}
                        aria-label={showPassword ? "Hide password" : "Show password"}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                      >
                        {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                  </FormControl>
                  <PasswordStrength control={form.control} />
                  <FormMessage />
                </FormItem>
              )}
            />
          </motion.div>

          {/* Confirm password */}
          <motion.div variants={slideUp} layout>
            <FormField
              control={form.control}
              name="confirmPassword"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Confirm Password</FormLabel>
                  <FormControl>
                    <div className="relative">
                      <Input
                        type={showConfirm ? "text" : "password"}
                        placeholder=""
                        className="pr-10"
                        disabled={isLoading}
                        autoComplete="new-password"
                        {...field}
                      />
                      <button
                        type="button"
                        onClick={() => setShowConfirm((v) => !v)}
                        aria-label={showConfirm ? "Hide password" : "Show password"}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                      >
                        {showConfirm ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </motion.div>

          {/* Terms & Conditions checkbox */}
          <motion.div variants={slideUp} layout>
            <FormField
              control={form.control}
              name="termsAccepted"
              render={({ field }) => (
                <FormItem className="flex flex-row items-start gap-3 rounded-lg border border-border bg-card/50 p-4">
                  <FormControl>
                    <Checkbox
                      checked={field.value}
                      onCheckedChange={field.onChange}
                      disabled={isLoading}
                      className="mt-0.5"
                      id="terms-checkbox"
                    />
                  </FormControl>
                  <div className="space-y-1 leading-none">
                    <FormLabel htmlFor="terms-checkbox" className="text-sm font-normal text-foreground cursor-pointer">
                      I have read and accept the{" "}
                      <button
                        type="button"
                        onClick={() => setShowTermsModal(true)}
                        className="text-primary font-semibold underline underline-offset-4 hover:text-primary/80 transition-colors"
                      >
                        Terms and Conditions
                      </button>
                    </FormLabel>
                    <FormMessage />
                  </div>
                </FormItem>
              )}
            />
          </motion.div>

          {/* Submit button — disabled until terms accepted */}
          <motion.div variants={slideUp} layout whileHover={{ scale: 1.01 }} whileTap={{ scale: 0.98 }}>
            <Button
              type="submit"
              className="w-full h-11 text-base font-semibold"
              disabled={isLoading || !termsAccepted}
            >
              {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : "Create Account"}
            </Button>
            {!termsAccepted && (
              <p className="text-xs text-muted-foreground text-center mt-2">
                You must accept the Terms and Conditions to register.
              </p>
            )}
          </motion.div>

          <motion.p variants={slideUp} layout className="text-center text-sm text-muted-foreground">
            Already have an account?{" "}
            <Link href="/sign-in" className="text-primary font-medium hover:underline underline-offset-4">
              Sign in
            </Link>
          </motion.p>
        </motion.form>
      </Form>

      {/* Terms Modal */}
      <TermsModal
        isOpen={showTermsModal}
        onClose={() => setShowTermsModal(false)}
        onAccept={() => {
          form.setValue("termsAccepted", true, { shouldValidate: true });
        }}
      />

      {/* OTP Modal — auto-shown right after registration */}
      {verificationState && (
        <VerifyOtpModal
          isOpen={showOtpModal}
          userId={verificationState.userId}
          email={verificationState.email}
          onVerified={handleOtpVerified}
          onClose={() => {
            setShowOtpModal(false);
            setVerificationState(null);
          }}
        />
      )}
    </motion.div>
  );
}
