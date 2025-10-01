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
   { title: "Dashboard", url: "/user/dashboard", icon: CircleDashedIcon },
  { title: "Cycle", url: "/user/cycles", icon: Recycle },
  { title: "Wallet", url: "/user/wallet", icon: Briefcase },
  { title: "investment", url: "/user/investments", icon: CopySlash },

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
