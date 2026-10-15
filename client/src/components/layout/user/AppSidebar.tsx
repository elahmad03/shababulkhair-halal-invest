'use client';

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Recycle,
  Wallet,
  TrendingUp,
  Bell,
} from "lucide-react";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarRail,
  useSidebar,
} from "@/components/ui/sidebar";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useGetMeQuery } from "@/store/modules/user/userApi";

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
  const { data: me } = useGetMeQuery();

  // Also highlights nested pages like /user/cycles/[id]
  const isActive = (url: string) =>
    pathname === url || pathname.startsWith(`${url}/`);

  const initials = me
    ? `${me.firstName?.[0] ?? ""}${me.lastName?.[0] ?? ""}`.toUpperCase()
    : "";

  return (
    <Sidebar collapsible="icon">
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton size="lg" asChild>
              <Link href="/user/dashboard" onClick={() => setOpenMobile(false)}>
                <div className="flex size-8 items-center justify-center rounded-lg bg-primary text-sm font-semibold text-primary-foreground">
                  M
                </div>
                <div className="grid flex-1 text-left text-sm leading-tight">
                  <span className="truncate font-semibold">Member Portal</span>
                  <span className="truncate text-xs text-muted-foreground">
                    Investments
                  </span>
                </div>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>

      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Menu</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {items.map(({ title, url, icon: Icon }) => (
                <SidebarMenuItem key={url}>
                  <SidebarMenuButton
                    asChild
                    isActive={isActive(url)}
                    tooltip={title}
                    className="font-medium data-[active=true]:bg-primary data-[active=true]:text-primary-foreground data-[active=true]:shadow-sm"
                  >
                    <Link href={url} onClick={() => setOpenMobile(false)}>
                      <Icon />
                      <span>{title}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton size="lg" tooltip={me?.email}>
              <Avatar className="size-8 rounded-lg">
                <AvatarImage src={me?.avatarUrl} alt={me?.firstName} />
                <AvatarFallback className="rounded-lg">
                  {initials || "?"}
                </AvatarFallback>
              </Avatar>
              <div className="grid flex-1 text-left text-sm leading-tight">
                <span className="truncate font-medium">
                  {me ? `${me.firstName} ${me.lastName}` : "Loading..."}
                </span>
                <span className="truncate text-xs text-muted-foreground">
                  {me?.email}
                </span>
              </div>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>

      <SidebarRail />
    </Sidebar>
  );
}