"use client";

import { SidebarComponent } from "@/components/dashboard/sidebarComponent";
import { Header } from "@/components/dashboard/header";
import { SidebarProvider, SidebarInset } from "@/components/ui/sidebar";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <SidebarProvider>
      <SidebarComponent />
      <SidebarInset className="flex flex-col h-screen overflow-hidden">
        <Header />
        <main className="flex-1 overflow-auto">{children}</main>
      </SidebarInset>
    </SidebarProvider>
  );
}
