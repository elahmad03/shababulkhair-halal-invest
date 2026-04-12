// components/shared/AuthGuard.tsx
"use client";

import { useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";
import { useSelector } from "react-redux";
import { 
  selectIsAuthenticated, 
  selectIsInitialized, 
  selectCurrentUser 
} from "@/store/modules/auth/authSlice";

interface AuthGuardProps {
  children: React.ReactNode;
  allowedRoles?: Array<"USER" | "ADMIN"| "MEMBER"|"COMMITEE">; // Pass roles if the route is restricted
}

export function AuthGuard({ children, allowedRoles }: AuthGuardProps) {
  const router = useRouter();
  const pathname = usePathname();
  
  const isInitialized = useSelector(selectIsInitialized);
  const isAuthenticated = useSelector(selectIsAuthenticated);
  const user = useSelector(selectCurrentUser);

// console.log("AUTH GUARD CHECK:", { isInitialized, isAuthenticated, role: user?.role, allowedRoles });

  useEffect(() => {
    // 1. Wait until Redux has finished the initial /refresh check
    if (!isInitialized) return;

    // 2. Not logged in? Kick them to the login page and save where they were trying to go
    if (!isAuthenticated) {
      router.replace(`/sign-in?callbackUrl=${encodeURIComponent(pathname)}`);
      return;
    }

    // 3. Logged in, but wrong role? (e.g., User trying to access /admin)
    if (allowedRoles && user && !allowedRoles.includes(user.role)) {
      // Send them to their appropriate dashboard based on their actual role
      if (user.role === "ADMIN") {
        router.replace("/admin/dashboard");
      } else {
        router.replace("/user/dashboard");
      }
    }
  }, [isInitialized, isAuthenticated, user, router, pathname, allowedRoles]);

  // Show a loading screen while we wait for the AuthInitializer to finish
  if (!isInitialized) {
    return (
      <div className="flex h-screen w-full items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
      </div>
    );
  }

  // If initialized and authenticated, check roles before rendering children
  if (isAuthenticated) {
    // If role restrictions exist, ensure user is loaded before rendering
    if (allowedRoles) {
      if (!user || !allowedRoles.includes(user.role)) {
        return null; // Don't render until user loads or while redirecting
      }
    }
    return <>{children}</>;
  }

  // Fallback (usually caught by the useEffect redirect first)
  return null;
}