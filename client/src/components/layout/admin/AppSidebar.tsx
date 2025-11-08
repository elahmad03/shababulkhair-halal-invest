'use client';

import Link from "next/link";
import { usePathname } from "next/navigation";
import { 
  LayoutDashboard,
  Recycle, 
  Briefcase, 
  ArrowRightLeft,
  Users,
  Receipt,
  BookOpen,
  ArrowDownToLine,
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

const items = [
  { title: "Dashboard", url: "/admin/dashboard", icon: LayoutDashboard },
  { title: "Manage Cycle", url: "/admin/cycles", icon: Recycle },
  { title: "Manage Business", url: "/admin/business", icon: Briefcase },
  { title: "Transactions", url: "/admin/transactions", icon: ArrowRightLeft },
  { title: "Manage Investors", url: "/admin/users", icon: Users },
  { title: "Manage Expenses", url: "/admin/expenses", icon: Receipt },
  { title: "Manage Ledger", url: "/admin/ledger", icon: BookOpen },
  { title: "Manage Withdrawals", url: "/admin/withdrawals", icon: ArrowDownToLine },
  { title: "Manage Notifications", url: "/admin/notifications", icon: Bell },
];

export function AppSidebar() {
  const pathname = usePathname();

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
                      onClick={handleLinkClick}
                        href={url}
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

function setOpenMobile(arg0: boolean) {
  throw new Error("Function not implemented.");
}
