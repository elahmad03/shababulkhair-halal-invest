'use client';

import Link from "next/link";
import { usePathname } from "next/navigation";
import { 
  LayoutDashboard,
  Recycle, 
  Wallet,
  TrendingUp,
  Bell
} from "lucide-react";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";
import { useSidebar } from "@/components/ui/sidebar";

const items = [
  { title: "Dashboard", url: "/user/dashboard", icon: LayoutDashboard },
  { title: "Cycle", url: "/user/cycles", icon: Recycle },
  { title: "Wallet", url: "/user/wallet", icon: Wallet },
  { title: "Investment", url: "/user/investments", icon: TrendingUp },
  { title: "Notifications", url: "/user/notifications", icon: Bell },
];

export function AppSidebar() {
  const pathname = usePathname();
  const { setOpenMobile } = useSidebar();

  const handleLinkClick = () => {
    // Close sidebar on mobile when link is clicked
    setOpenMobile(false);
  };

  return (
    <Sidebar className="w-64 bg-gray-900 dark:bg-gray-900 h-full">
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupContent>
            <SidebarMenu>
              {items.map(({ title, url, icon: Icon }) => {
                const isActive = pathname === url;
                return (
                  <SidebarMenuItem key={title}>
                    <SidebarMenuButton asChild>
                      <Link
                        href={url}
                        onClick={handleLinkClick}
                        className={`flex items-center gap-3 px-4 py-2 rounded-md w-full font-medium transition-all
                          ${isActive
                            ? "bg-gradient-to-r from-emerald-600 to-green-500 text-white shadow-md"
                            : "text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 hover:text-gray-900 dark:hover:text-white"}
                        `}
                      >
                        <Icon className="w-5 h-5" />
                        <span>{title}</span>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                );
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  );
}