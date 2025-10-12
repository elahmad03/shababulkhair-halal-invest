'use client';

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Recycle, Briefcase, CopySlash, User2, ReceiptPoundSterling, ArrowBigDown, CircleDashedIcon } from "lucide-react";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";
import { Card, CardContent } from "@/components/ui/card";

const items = [
   { title: "Dashboard", url: "/admin/dashboard", icon: CircleDashedIcon },
  { title: "Manage Cycle", url: "/admin/cycles", icon: Recycle },
  { title: "Manage Business", url: "/admin/business", icon: Briefcase },
  { title: "transactions", url: "/admin/transactions", icon: CopySlash },
   { title: "Manage investors", url: "/admin/users", icon: User2 },
    { title: "Manage expenses", url: "/admin/expenses", icon: ReceiptPoundSterling},
     { title: "Manage withdrawals", url: "/admin/withdrawals", icon: ArrowBigDown },
     
];

export function AppSidebar() {
  const pathname = usePathname();

  return (
    <Sidebar className="w-64 bg-gray-900 text-gray-300 h-full">
      <SidebarContent>
        {/* <Card>
          <CardContent>
            user sample
          </CardContent>
        </Card> */}
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
                        className={`flex items-center gap-3 px-4 py-2 rounded-md w-full font-medium
                          ${isActive
                            ? "bg-gradient-to-r from-emerald-600 to-green-500 text-white shadow-md"
                            : "hover:bg-gray-900 text-gray-800 transition"}
                        `}
                      >
                        <Icon className="w-4 h-4" />
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
