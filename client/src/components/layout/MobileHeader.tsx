"use client";

import { SidebarTrigger } from "@/components/ui/sidebar";
import { Menu, LogOut, User, Bell, Sun, Moon, ShieldCheck } from "lucide-react";
import { Avatar, AvatarImage, AvatarFallback } from "@radix-ui/react-avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import { useAppSelector, useAppDispatch } from "@/store/hooks";
import { logout } from "@/store/features/auth/authSlice";
import { useRouter } from "next/navigation";
import { useTheme } from "next-themes";
import { useEffect, useState } from "react";
import Image from "next/image";

export default function Topbar() {
  const router = useRouter();

  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

 

  return (
    <header className="relative px-4 py-4 border-b bg-white dark:bg-gray-900 flex items-center justify-between">
      {/* Left: Logo and toggle */}
      <div className="flex items-center gap-4">
        <div className="md:hidden">
          <SidebarTrigger>
            <Menu className="w-6 h-6 text-gray-800 dark:text-white" />
          </SidebarTrigger>
        </div>
        <h1 className="text-xl font-bold text-emerald-600">
          <Image
            src="/logo.png"
            width={32}
            height={32}
            alt={"shaba bulkhair"}
          />{" "}
          Shababulkhair
        </h1>
      </div>

      {/* Right: Icons and Avatar */}
      <div className="flex items-center gap-4">
        {/* Notifications */}
        <button
          aria-label="Notifications"
          className="border-1 p-2 rounded-xl  text-gray-600 dark:text-gray-300 hover:text-emerald-500"
        >
          <Bell className="w-5 h-5 " />
        </button>

        {/* Dark/Light Toggle */}
        {mounted && (
          <button
            aria-label="Toggle Theme"
            onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
            className="border-1 p-2 rounded-xl text-gray-600 dark:text-gray-300 hover:text-emerald-500"
          >
            {theme === "dark" ? (
              <Sun className="w-5 h-5" />
            ) : (
              <Moon className="w-5 h-5" />
            )}
          </button>
        )}

        {/* Avatar Dropdown */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Avatar className="border-1 p-2 rounded-full cursor-pointer">
              <AvatarImage
                src={"/noImage.png"}
                className="w-8 h-8 rounded-full object-cover"
              />
              <AvatarFallback>{ "U"}</AvatarFallback>
            </Avatar>
          </DropdownMenuTrigger>
          <DropdownMenuContent className="w-48 bg-white dark:bg-gray-900 p-1 rounded-md shadow z-50">
            { (
              <div className="flex items-center px-3 py-2 text-xs text-gray-500 gap-2">
                <ShieldCheck className="w-4 h-4 text-emerald-500" />
                <span className="uppercase font-semibold">Admin</span>
              </div>
            )}

            <DropdownMenuSeparator />

            <DropdownMenuItem
              onClick={() => router.push("/user/profile")}
              className="flex gap-2 items-center px-3 py-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded"
            >
              <User className="w-4 h-4" />
              Profile
            </DropdownMenuItem>

            <DropdownMenuItem
              
              className="flex gap-2 items-center px-3 py-2 text-red-600 dark:text-red-400 hover:bg-red-100 dark:hover:bg-red-900 rounded"
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
