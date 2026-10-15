'use client';

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Recycle,
  Briefcase,
  ArrowRightLeft,
  Users,
  IdCard,
  Receipt,
  BookOpen,
  ArrowDownToLine,
  Bell,
  type LucideIcon,
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
  SidebarMenuBadge,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarRail,
  useSidebar,
} from "@/components/ui/sidebar";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useGetMeQuery } from "@/store/modules/user/userApi";
import { useGetPendingKycQuery } from "@/store/modules/kyc/adminKycApi";

type NavItem = {
  title: string;
  url: string;
  icon: LucideIcon;
  badge?: number;
};

type NavGroup = { label: string; items: NavItem[] };

export function AdminSidebar() {
  const pathname = usePathname();
  const { setOpenMobile } = useSidebar();
  const { data: me } = useGetMeQuery();
  const { data: pending } = useGetPendingKycQuery();

  const pendingCount = pending?.data?.length ?? 0;

  const groups: NavGroup[] = [
    {
      label: "Overview",
      items: [
        { title: "Dashboard", url: "/admin/dashboard", icon: LayoutDashboard },
      ],
    },
    {
      label: "Investments",
      items: [
        { title: "Manage Cycle", url: "/admin/cycles", icon: Recycle },
        { title: "Manage Business", url: "/admin/business", icon: Briefcase },
      ],
    },
    {
      label: "People",
      items: [
        { title: "Manage Investors", url: "/admin/users", icon: Users },
        {
          title: "KYC Review",
          url: "/admin/kyc",
          icon: IdCard,
          badge: pendingCount,
        },
      ],
    },
    {
      label: "Finance",
      items: [
        { title: "Transactions", url: "/admin/transactions", icon: ArrowRightLeft },
        { title: "Manage Expenses", url: "/admin/expenses", icon: Receipt },
        { title: "Manage Ledger", url: "/admin/ledger", icon: BookOpen },
        { title: "Manage Withdrawals", url: "/admin/withdrawals", icon: ArrowDownToLine },
      ],
    },
    {
      label: "System",
      items: [
        { title: "Manage Notifications", url: "/admin/notifications", icon: Bell },
      ],
    },
  ];

  // Also highlights nested pages like /admin/users/[id]
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
              <Link href="/admin/dashboard" onClick={() => setOpenMobile(false)}>
                <div className="flex size-8 items-center justify-center rounded-lg bg-gradient-to-br from-emerald-600 to-green-500 text-sm font-semibold text-white">
                  A
                </div>
                <div className="grid flex-1 text-left text-sm leading-tight">
                  <span className="truncate font-semibold">Admin Console</span>
                  <span className="truncate text-xs text-muted-foreground">
                    Management
                  </span>
                </div>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>

      <SidebarContent>
        {groups.map((group) => (
          <SidebarGroup key={group.label}>
            <SidebarGroupLabel>{group.label}</SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                {group.items.map(({ title, url, icon: Icon, badge }) => (
                  <SidebarMenuItem key={url}>
                    <SidebarMenuButton
                      asChild
                      isActive={isActive(url)}
                      tooltip={title}
                      className="font-medium transition-all data-[active=true]:bg-gradient-to-r data-[active=true]:from-emerald-600 data-[active=true]:to-green-500 data-[active=true]:text-white data-[active=true]:shadow-md"
                    >
                      <Link href={url} onClick={() => setOpenMobile(false)}>
                        <Icon />
                        <span>{title}</span>
                      </Link>
                    </SidebarMenuButton>
                    {!!badge && <SidebarMenuBadge>{badge}</SidebarMenuBadge>}
                  </SidebarMenuItem>
                ))}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        ))}
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

// Keeps your old import name working too
export { AdminSidebar as AppSidebar };