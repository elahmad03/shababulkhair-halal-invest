'use client';

import { SidebarProvider } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/layout/admin/AppSidebar";
import Topbar from "@/components/layout/MobileHeader";

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <SidebarProvider>
      <div className="flex min-h-screen w-full overflow-hidden">
        {/* Sidebar: show on md+ */}
        <div className="hidden md:block">
          <AppSidebar />
        </div>

        <div className="flex-1 flex flex-col min-w-0">
          {/* Top navigation bar */}
          <Topbar />
          <main className="p-4 w-full">{children}</main>
        </div>
      </div>
    </SidebarProvider>
  );
}