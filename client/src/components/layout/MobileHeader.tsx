"use client";

import { useEffect, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { useTheme } from "next-themes";
import Image from "next/image";
import { useSelector } from "react-redux";

// UI Components
import { SidebarTrigger } from "@/components/ui/sidebar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarImage, AvatarFallback } from "@radix-ui/react-avatar";
import { Menu, LogOut, User, Sun, Moon, ShieldCheck, Loader2 } from "lucide-react";
import NotificationDropdown from "@/components/user/notifications/NotificalDropdown";

// API & Store
import { useLogoutMutation } from "@/store/modules/auth/authApi"; // Adjust path if needed
// import type { RootState } from "@/store"; // Uncomment and adjust path for strict typing

export default function Topbar() {
  const router = useRouter();
  const pathname = usePathname();
  const { theme, setTheme } = useTheme();
  
  // Hydration state to prevent Next.js mismatch errors with next-themes
  const [mounted, setMounted] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);

  // Auth & State Integration
  // Replace `any` with `RootState` once imported
  const user = useSelector((state: any) => state.auth.user); 
  const [logoutUser, { isLoading: isLoggingOut }] = useLogoutMutation();

  useEffect(() => {
    setMounted(true);
  }, []);

  // Secure Logout Handler
  const handleLogout = async () => {
    try {
      // The actual token clearing happens instantly via onQueryStarted in your API slice
      await logoutUser().unwrap();
      setDropdownOpen(false);
      router.push("/login");
    } catch (error) {
      console.error("Logout failed to process on server, but local state was cleared.", error);
      // Failsafe: push to login anyway since local credentials are gone
      router.push("/login"); 
    }
  };

  // Determine dashboard routing context
  const showAdminLink = pathname.startsWith("/user") || pathname === "/";
  const showUserLink = pathname.startsWith("/admin") || pathname === "/" || pathname === "/about";

  // Fallback generation for Avatar
  const getInitials = (name?: string) => {
    if (!name) return "U";
    return name.substring(0, 2).toUpperCase();
  };

  return (
    <header className="relative px-4 py-4 border-b bg-white dark:bg-gray-900 flex items-center justify-between z-40">
      {/* Left: Brand & Mobile Toggle */}
      <div className="flex items-center gap-4">
        <div className="md:hidden">
          <SidebarTrigger aria-label="Toggle Sidebar">
            <Menu className="w-6 h-6 text-gray-800 dark:text-white transition-colors hover:text-emerald-500" />
          </SidebarTrigger>
        </div>
        <span className="text-xl font-bold text-emerald-600 flex items-center gap-2 select-none">
          <Image src="/logo.png" width={32} height={32} alt="Shababulkhair Logo" priority />
          <span className="hidden sm:inline tracking-tight">Shababulkhair</span>
        </span>
      </div>

      {/* Right: Actions & Profile */}
      <div className="flex items-center gap-2 sm:gap-4">
        {/* Notifications (Mocked until API is ready) */}
        <NotificationDropdown notifications={[]} userId={user?.id || 0} />

        {/* Theme Toggle */}
        {mounted ? (
          <button
            aria-label="Toggle Theme"
            onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
            className="border p-2 rounded-xl text-gray-600 dark:text-gray-300 hover:text-emerald-500 hover:border-emerald-500 transition-all focus:outline-none focus:ring-2 focus:ring-emerald-500/50"
          >
            {theme === "dark" ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
          </button>
        ) : (
          // Placeholder to prevent layout shift during hydration
          <div className="w-9 h-9 border rounded-xl" /> 
        )}

        {/* User Profile Dropdown */}
        <DropdownMenu open={dropdownOpen} onOpenChange={setDropdownOpen}>
          <DropdownMenuTrigger asChild>
            <Avatar 
              className="border p-1 rounded-full cursor-pointer hover:ring-2 hover:ring-emerald-500 transition-all focus:outline-none bg-gray-50 dark:bg-gray-800"
              aria-label="User menu"
            >
              <AvatarImage 
                src={user?.profilePictureUrl || "/noImage.png"} 
                alt={`${user?.fullName || 'User'} profile picture`}
                className="w-8 h-8 rounded-full object-cover" 
              />
              <AvatarFallback className="w-8 h-8 flex items-center justify-center rounded-full bg-emerald-100 text-emerald-700 font-semibold text-sm">
                {getInitials(user?.fullName)}
              </AvatarFallback>
            </Avatar>
          </DropdownMenuTrigger>

          <DropdownMenuContent 
            align="end" 
            className="w-56 bg-white dark:bg-gray-900 p-1 rounded-xl shadow-lg border dark:border-gray-800 z-50"
          >
            <div className="px-3 py-2 flex flex-col gap-0.5">
              <span className="text-sm font-semibold text-gray-900 dark:text-gray-100 truncate">
                {user?.fullName || "Ahmad"}
              </span>
              <span className="text-xs text-gray-500 dark:text-gray-400 truncate">
                {user?.email || "User Account"}
              </span>
            </div>

            <DropdownMenuSeparator className="bg-gray-100 dark:bg-gray-800 my-1" />

            {showAdminLink && (
              <DropdownMenuItem
                onClick={() => {
                  router.push("/admin/dashboard");
                  setDropdownOpen(false);
                }}
                className="flex gap-2 items-center px-3 py-2 text-sm hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg cursor-pointer transition-colors focus:bg-gray-100 dark:focus:bg-gray-800"
              >
                <ShieldCheck className="w-4 h-4 text-emerald-500" />
                Admin Dashboard
              </DropdownMenuItem>
            )}

            {showUserLink && (
              <DropdownMenuItem
                onClick={() => {
                  router.push("/user/dashboard");
                  setDropdownOpen(false);
                }}
                className="flex gap-2 items-center px-3 py-2 text-sm hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg cursor-pointer transition-colors focus:bg-gray-100 dark:focus:bg-gray-800"
              >
                <User className="w-4 h-4 text-gray-500" />
                User Dashboard
              </DropdownMenuItem>
            )}

            <DropdownMenuSeparator className="bg-gray-100 dark:bg-gray-800 my-1" />

            <DropdownMenuItem
              onClick={() => {
                router.push("/user/profile");
                setDropdownOpen(false);
              }}
              className="flex gap-2 items-center px-3 py-2 text-sm hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg cursor-pointer transition-colors focus:bg-gray-100 dark:focus:bg-gray-800"
            >
              <User className="w-4 h-4 text-gray-500" />
              Profile Settings
            </DropdownMenuItem>

            <DropdownMenuItem
              onClick={(e) => {
                e.preventDefault(); // Prevent menu from closing immediately so loading spinner shows
                handleLogout();
              }}
              disabled={isLoggingOut}
              className="flex gap-2 items-center px-3 py-2 text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg cursor-pointer transition-colors focus:bg-red-50 dark:focus:bg-red-900/20 disabled:opacity-50 disabled:cursor-not-allowed mt-1"
            >
              {isLoggingOut ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <LogOut className="w-4 h-4" />
              )}
              {isLoggingOut ? "Signing out..." : "Sign out"}
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}