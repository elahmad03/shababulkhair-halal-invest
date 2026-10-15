'use client';

import { SidebarProvider } from "@/components/ui/sidebar";
import Topbar from "@/components/layout/MobileHeader";
import { AuthGuard } from "@/components/shared/AuthGuard";
import { AdminSidebar } from "@/components/layout/admin/AppSidebar";

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <AuthGuard allowedRoles={["ADMIN"]}>
    <SidebarProvider>
      <div className="flex min-h-screen w-full overflow-hidden">
        {/* Sidebar: show on md+ */}
        <div className="hidden md:block">
          <AdminSidebar />
        </div>

        <div className="flex-1 flex flex-col min-w-0">
          {/* Top navigation bar */}
          <Topbar />
          <main className="p-4 w-full">{children}</main>
        </div>
      </div>
    </SidebarProvider>
    </AuthGuard>
  );
}