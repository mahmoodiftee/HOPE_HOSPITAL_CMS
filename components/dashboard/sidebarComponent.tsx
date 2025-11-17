"use client";

import { usePathname } from "next/navigation";
import Link from "next/link";
import { CalendarClock, Users, User, Layout } from "lucide-react";

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
} from "@/components/ui/sidebar";

const navigation = [
  {
    name: "Dashboard",
    href: "/dashboard",
    icon: Layout,
  },
  {
    name: "Doctors",
    href: "/dashboard/doctors",
    icon: Users,
  },
  {
    name: "Available Time Slots",
    href: "/dashboard/available-time-slots",
    icon: CalendarClock,
  },
  {
    name: "Users",
    href: "/dashboard/users",
    icon: User,
  },
];

export function SidebarComponent() {
  const pathname = usePathname();

  return (
    <Sidebar>
      <SidebarHeader className="px-3 py-4 border-b border-border">
        <div>
          <h2 className="text-lg font-semibold text-foreground">CMS</h2>
          <p className="font-medium text-xs text-primary">HOPE HOSPITAL</p>
        </div>
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Application</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {navigation.map((item) => {
                const isActive = pathname === item.href;
                return (
                  <SidebarMenuItem key={item.name}>
                    <SidebarMenuButton asChild isActive={isActive}>
                      <Link href={item.href}>
                        <item.icon />
                        <span>{item.name}</span>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                );
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
      <SidebarFooter>
        <div className="px-4 py-2">
          <p className="text-xs text-muted-foreground">
            © 2025 HOPE HOSPITAL CMS
          </p>
        </div>
      </SidebarFooter>
    </Sidebar>
  );
}
