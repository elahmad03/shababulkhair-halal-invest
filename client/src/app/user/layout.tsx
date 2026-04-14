'use client';

import { SidebarProvider } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/layout/user/AppSidebar";
import Topbar from "@/components/layout/MobileHeader";
import { AuthGuard } from "@/components/shared/AuthGuard";

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <AuthGuard allowedRoles={["USER", "ADMIN","COMMITEE","MEMBER"]}>
    <SidebarProvider>
      <div className="flex min-h-screen w-full">
        {/* Sidebar: show on md+ */}
        <div className="hidden md:block">
          <AppSidebar />
        </div>

        <div className="flex-1 flex flex-col min-w-0">
          {/* Top navigation bar */}
          <Topbar />
          <main className="flex-1 p-4">{children}</main>
        </div>
      </div>
    </SidebarProvider>
    </AuthGuard>
  );
}
