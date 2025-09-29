'use client';

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Recycle, Briefcase } from "lucide-react";
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
  { title: "Open Cycle", url: "/admin/cycle", icon: Recycle },
  { title: "Business", url: "/admin/business", icon: Briefcase },
];

export function AppSidebar() {
  const pathname = usePathname();

  return (
    <Sidebar className="w-64 bg-gray-900 text-white h-full">
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
                        className={`flex items-center gap-3 px-4 py-2 rounded-md w-full font-medium
                          ${isActive
                            ? "bg-gradient-to-r from-emerald-600 to-green-500 text-white shadow-md"
                            : "hover:bg-gray-800 text-gray-300 transition"}
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
