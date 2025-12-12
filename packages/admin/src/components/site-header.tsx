"use client";

import { SidebarIcon } from "lucide-react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import * as React from "react";

import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { useSidebar } from "@/components/ui/sidebar";

export function SiteHeader() {
  const { toggleSidebar } = useSidebar();
  const pathname = usePathname();

  const crumbs = React.useMemo(() => {
    const labelMap: Record<string, string> = {
      dashboard: "Dashboard",
      clientes: "Clientes",
      leads: "Leads",
      tareas: "Tareas",
      github: "GitHub",
      archivos: "Archivos",
      servidores: "Servidores",
      config: "Config",
    };

    const parts = (pathname || "/").split("/").filter(Boolean);

    if (parts[0] !== "dashboard") {
      return [] as { href: string; label: string; current: boolean }[];
    }

    const acc: { href: string; label: string; current: boolean }[] = [];
    let href = "";
    for (let i = 0; i < parts.length; i++) {
      href += `/${parts[i]}`;
      const raw = parts[i];
      const label = labelMap[raw] ?? decodeURIComponent(raw);
      acc.push({ href, label, current: i === parts.length - 1 });
    }
    return acc;
  }, [pathname]);

  return (
    <header className="flex sticky top-0 z-50 w-full items-center border-b bg-background">
      <div className="flex h-[--header-height] w-full items-center gap-1 px-4">
        <Button
          className="h-8 w-8"
          variant="ghost"
          size="icon"
          onClick={toggleSidebar}
        >
          <SidebarIcon />
        </Button>
        <Separator orientation="vertical" className="mr-2 h-4" />
        {crumbs.length ? (
          <Breadcrumb className="hidden sm:block">
            <BreadcrumbList>
              {crumbs.map((c, idx) => (
                <React.Fragment key={c.href}>
                  {idx > 0 ? <BreadcrumbSeparator /> : null}
                  <BreadcrumbItem>
                    {c.current ? (
                      <BreadcrumbPage>{c.label}</BreadcrumbPage>
                    ) : (
                      <BreadcrumbLink asChild>
                        <Link href={c.href}>{c.label}</Link>
                      </BreadcrumbLink>
                    )}
                  </BreadcrumbItem>
                </React.Fragment>
              ))}
            </BreadcrumbList>
          </Breadcrumb>
        ) : null}
      </div>
    </header>
  );
}
