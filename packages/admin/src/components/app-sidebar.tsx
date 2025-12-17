"use client";

import * as React from "react";
import {
  Command,
  File,
  Github,
  Server,
  Settings,
  Users,
  UserRoundPlus,
  CheckSquare,
  FolderKanban,
  MessageSquare,
} from "lucide-react";

import { NavMain } from "@/components/nav-main";
import { NavUser } from "@/components/nav-user";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarSeparator,
} from "@/components/ui/sidebar";
import Link from "next/link";

const data = {
  navMain: [
    {
      title: "Tareas",
      url: "/dashboard/tareas",
      icon: CheckSquare,
    },
    {
      title: "Chats",
      url: "/dashboard/chats",
      icon: MessageSquare,
    },
    {
      title: "Proyectos",
      url: "/dashboard/proyectos",
      icon: FolderKanban,
    },
    {
      title: "Clientes",
      url: "/dashboard/clientes",
      icon: Users,
    },
    {
      title: "Leads",
      url: "/dashboard/leads",
      icon: UserRoundPlus,
    },
    {
      title: "GitHub",
      url: "/dashboard/github",
      icon: Github,
    },
    // {
    //   title: "Archivos",
    //   url: "/dashboard/archivos",
    //   icon: File,
    // },
    {
      title: "Servidores",
      url: "/dashboard/servidores",
      icon: Server,
    },
  ],
  config: {
    title: "Configuración",
    url: "/dashboard/config",
    icon: Settings,
  },
};

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  return (
    <Sidebar
      className="top-[--header-height] !h-[calc(100svh-var(--header-height))]"
      {...props}
    >
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton size="lg" asChild>
              <Link href="/dashboard">
                <div className="flex aspect-square size-8 items-center justify-center rounded-lg bg-sidebar-primary text-sidebar-primary-foreground">
                  <Command className="size-4" />
                </div>
                <div className="grid flex-1 text-left text-xs leading-tight">
                  <span className="truncate font-semibold">Acentus</span>
                  <span className="truncate text-xs">Admin</span>
                </div>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      <SidebarContent>
        <NavMain items={data.navMain} />
        <SidebarSeparator />
        <div className="mt-auto">
          <NavMain items={[data.config]} />
        </div>
      </SidebarContent>
      <SidebarFooter>
        <NavUser />
      </SidebarFooter>
    </Sidebar>
  );
}
