"use client";

import { SidebarTrigger } from "@/components/ui/sidebar";
import { Menu, LogOut, User, Sun, Moon, ShieldCheck } from "lucide-react";
import { Avatar, AvatarImage, AvatarFallback } from "@radix-ui/react-avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import { usePathname, useRouter } from "next/navigation";
import { useTheme } from "next-themes";
import { useEffect, useState } from "react";
import Image from "next/image";
import NotificationDropdown from "@/components/user/notifications/NotificalDropdown";
import { mockNotifications, mockUserProfiles, mockUsers } from "@/db";

export default function Topbar() {
  const router = useRouter();
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const pathname = usePathname();

  useEffect(() => setMounted(true), []);

  // Get fake user from mockUsers
  // Prefer combining user record with profile (profile holds picture URL)
  const user = mockUsers.find((n) => n.id === 1);
  const profile = mockUserProfiles.find((p) => p.userId === user?.id);
  const currentUser = {
    fullName: user?.fullName ?? "User",
    profilePicture: profile?.profilePictureUrl ?? "/noImage.png",
  };

  // Determine which dashboard links to show
  const showAdminLink = pathname.startsWith("/user") || pathname === "/";
  const showUserLink =
    pathname.startsWith("/admin") || pathname === "/" || pathname === "/about";

  return (
    <header className="relative px-4 py-4 border-b bg-white dark:bg-gray-900 flex items-center justify-between">
      {/* Left: Logo and toggle */}
      <div className="flex items-center gap-4">
        <div className="md:hidden">
          <SidebarTrigger>
            <Menu className="w-6 h-6 text-gray-800 dark:text-white" />
          </SidebarTrigger>
        </div>
        <span className="text-xl font-bold text-emerald-600 flex items-center gap-2">
          <Image src="/logo.png" width={32} height={32} alt="shababulkhair" />
          <span className="hidden sm:inline">Shababulkhair</span>
        </span>
      </div>

      {/* Right: Icons and Avatar */}
      <div className="flex items-center gap-2 sm:gap-4">
        {/* Notifications */}
        <NotificationDropdown notifications={mockNotifications} userId={1} />

        {/* Dark/Light Toggle */}
        {mounted && (
          <button
            aria-label="Toggle Theme"
            onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
            className="border-1 p-2 rounded-xl text-gray-600 dark:text-gray-300 hover:text-emerald-500 transition-colors"
          >
            {theme === "dark" ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
          </button>
        )}

        {/* Avatar Dropdown */}
        <DropdownMenu open={dropdownOpen} onOpenChange={setDropdownOpen}>
          <DropdownMenuTrigger asChild>
            <Avatar className="border-1 p-2 rounded-full cursor-pointer hover:ring-2 hover:ring-emerald-500 transition-all">
                <AvatarImage src={currentUser.profilePicture} className="w-8 h-8 rounded-full object-cover" />
                <AvatarFallback>{currentUser.fullName?.[0] ?? "U"}</AvatarFallback>
            </Avatar>
          </DropdownMenuTrigger>

          <DropdownMenuContent className="w-48 bg-white dark:bg-gray-900 p-1 rounded-md shadow z-50">
            <div className="px-3 py-2 text-sm font-medium text-gray-700 dark:text-gray-300">
              {currentUser.fullName}
            </div>

            <DropdownMenuSeparator />

            {/* Conditional dashboard links */}
            {showAdminLink && (
              <DropdownMenuItem
                onClick={() => {
                  router.push("/admin/dashboard");
                  setDropdownOpen(false);
                }}
                className="flex gap-2 items-center px-3 py-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded cursor-pointer"
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
                className="flex gap-2 items-center px-3 py-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded cursor-pointer"
              >
                <User className="w-4 h-4" />
                User Dashboard
              </DropdownMenuItem>
            )}

            <DropdownMenuSeparator />

            <DropdownMenuItem
              onClick={() => {
                router.push("/user/profile");
                setDropdownOpen(false);
              }}
              className="flex gap-2 items-center px-3 py-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded cursor-pointer"
            >
              <User className="w-4 h-4" />
              Profile
            </DropdownMenuItem>

            <DropdownMenuItem
              onClick={() => {
                router.push("/login");
                setDropdownOpen(false);
              }}
              className="flex gap-2 items-center px-3 py-2 text-red-600 dark:text-red-400 hover:bg-red-100 dark:hover:bg-red-900 rounded cursor-pointer"
            >
              <LogOut className="w-4 h-4" />
              Logout
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}
