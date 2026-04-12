"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { motion, AnimatePresence, Variants } from "framer-motion";
import { useForm, useWatch, Control } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod"; 
import { Eye, EyeOff, Loader2, CheckCircle2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";

import { useRegisterMutation } from "@/store/modules/auth/authApi";
import type { RegisterRequest } from "@/types";

// -------------------------
// Schema
// -------------------------
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
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });

type RegisterForm = z.infer<typeof registerSchema>;

// -------------------------
// Animation Variants
// -------------------------
const staggerContainer: Variants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: {
      staggerChildren: 0.08,
    },
  },
};

const slideUp: Variants = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 300, damping: 24 } },
};

const popIn: Variants = {
  hidden: { opacity: 0, scale: 0.8 },
  show: { opacity: 1, scale: 1, transition: { type: "spring", stiffness: 400, damping: 20 } },
};

// -------------------------
// Password strength indicator
// -------------------------
function PasswordStrength({ control }: { control: Control<RegisterForm> }) {
  const password = useWatch({
    control,
    name: "password",
    defaultValue: "",
  });

  const checks = [
    { label: "8+ characters", pass: password.length >= 8 },
    { label: "Uppercase letter", pass: /[A-Z]/.test(password) },
    { label: "Number", pass: /[0-9]/.test(password) },
  ];

  const strength = checks.filter((c) => c.pass).length;
  
  const getColor = (index: number) => {
    if (index >= strength) return "hsl(var(--muted))";
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
          {/* Animated Progress Bars */}
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

          {/* Animated Checklist */}
          <motion.div 
            variants={staggerContainer}
            initial="hidden"
            animate="show"
            className="flex gap-3 flex-wrap"
          >
            {checks.map((check) => (
              <motion.span
                variants={popIn}
                key={check.label}
                layout
                className={`text-xs flex items-center gap-1.5 transition-colors duration-300 ${
                  check.pass ? "text-foreground" : "text-muted-foreground"
                }`}
              >
                <motion.div
                  initial={false}
                  animate={{ scale: check.pass ? [1, 1.2, 1] : 1 }}
                  transition={{ duration: 0.3 }}
                >
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

// -------------------------
// Page
// -------------------------
export default function SignUpPage() {
  const router = useRouter();
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);

  const [register, { isLoading }] = useRegisterMutation();

  const form = useForm<RegisterForm>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      firstName: "", lastName: "", email: "", phoneNumber: "", password: "", confirmPassword: "",
    },
  });

  const onSubmit = async (values: RegisterForm) => {
    setServerError(null);
    try {
      const payload: RegisterRequest = {
        firstName: values.firstName,
        lastName: values.lastName,
        email: values.email,
        phoneNumber: values.phoneNumber,
        password: values.password,
      };

      const res = await register(payload).unwrap();
      router.push(`/verify?userId=${res.data.userId}&email=${encodeURIComponent(values.email)}`);
    } catch (err: unknown) {
      const error = err as { data?: { message?: string } };
      setServerError(error?.data?.message ?? "Something went wrong. Please try again.");
    }
  };

  return (
    <motion.div 
      layout 
      className="space-y-8"
    >
      <motion.div 
        variants={slideUp} 
        initial="hidden" 
        animate="show" 
        className="space-y-2"
      >
        <h2 className="text-3xl font-bold text-foreground tracking-tight">Create your account</h2>
        <p className="text-muted-foreground text-sm">Join us today For Halal investment.</p>
      </motion.div>

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
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <motion.div variants={slideUp} layout>
              <FormField
                control={form.control}
                name="firstName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>First Name</FormLabel>
                    <FormControl>
                      <Input placeholder="Ahmad" disabled={isLoading} {...field} />
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
                      <Input placeholder="Ibrahim" disabled={isLoading} {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </motion.div>
          </div>

          <motion.div variants={slideUp} layout>
            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Email Address</FormLabel>
                  <FormControl>
                    <Input type="email" placeholder="ahmad@example.com" disabled={isLoading} {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </motion.div>

          <motion.div variants={slideUp} layout>
            <FormField
              control={form.control}
              name="phoneNumber"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Phone Number</FormLabel>
                  <FormControl>
                    <Input type="tel" placeholder="08012345678" disabled={isLoading} {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </motion.div>

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
                        placeholder="Create a strong password"
                        className="pr-10"
                        disabled={isLoading}
                        {...field}
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword((v) => !v)}
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
                        placeholder="Repeat your password"
                        className="pr-10"
                        disabled={isLoading}
                        {...field}
                      />
                      <button
                        type="button"
                        onClick={() => setShowConfirm((v) => !v)}
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

          <motion.div 
            variants={slideUp} 
            layout
            whileHover={{ scale: 1.01 }}
            whileTap={{ scale: 0.98 }}
          >
            <Button type="submit" className="w-full h-11 text-base font-semibold group" disabled={isLoading}>
              {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : "Create Account"}
            </Button>
          </motion.div>

          <motion.p variants={slideUp} layout className="text-center text-sm text-muted-foreground">
            Already have an account?{" "}
            <Link href="/sign-in" className="text-primary font-medium hover:underline underline-offset-4">
              Sign in
            </Link>
          </motion.p>
        </motion.form>
      </Form>
    </motion.div>
  );
}