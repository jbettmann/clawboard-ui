"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import {
  BotMessageSquare,
  Cable,
  House,
  ScrollText,
  Settings2,
  Sparkles,
  Wrench,
} from "lucide-react";

import { ThemeToggle } from "@/components/theme-toggle";
import {
  Sidebar,
  SidebarClose,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarInset,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarProvider,
  SidebarTrigger,
  useSidebar,
} from "@/components/ui/sidebar";
import { cn } from "@/lib/utils";

const SIDEBAR_PREFERENCE_KEY = "clawboard-ui-sidebar-collapsed";

const navItems = [
  { href: "/", label: "Home", icon: House },
  { href: "/chat", label: "Chat", icon: BotMessageSquare },
  { href: "/skills", label: "Skills", icon: Sparkles },
  { href: "/jobs", label: "Jobs", icon: Wrench },
  { href: "/outputs", label: "Outputs", icon: ScrollText },
  { href: "/connections", label: "Connections", icon: Cable },
  { href: "/settings", label: "Settings", icon: Settings2 },
];

type AppShellProps = {
  pathname: string;
  children: React.ReactNode;
};

function AppSidebar({ pathname }: { pathname: string }) {
  const { open, isMobile, setOpenMobile } = useSidebar();

  const renderedNav = useMemo(
    () =>
      navItems.map((item) => {
        const active = pathname === item.href || pathname.startsWith(`${item.href}/`);
        const Icon = item.icon;

        return (
          <SidebarMenuItem key={item.href}>
            <SidebarMenuButton asChild isActive={active} tooltip={item.label}>
              <Link href={item.href} onClick={() => isMobile && setOpenMobile(false)}>
                <Icon className="size-5 shrink-0" aria-hidden="true" />
                <span className={cn("truncate transition-opacity duration-200", !isMobile && !open ? "opacity-0" : "opacity-100")}>
                  {item.label}
                </span>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        );
      }),
    [isMobile, open, pathname, setOpenMobile],
  );

  return (
    <Sidebar>
      <SidebarHeader>
        <div className="flex items-start justify-between gap-3">
          <div className={cn("min-w-0", !isMobile && !open ? "text-center" : "") }>
            <p className="text-[0.7rem] font-semibold uppercase tracking-[0.4em] text-[var(--color-text-muted)]">
              Clawboard
            </p>
            <h1 className={cn("mt-1 text-lg font-semibold text-[var(--color-text-strong)] transition-opacity duration-200", !isMobile && !open ? "opacity-0" : "opacity-100")}>
              Daily Companion
            </h1>
            <p className={cn("mt-1 text-sm text-[var(--color-text-muted)] transition-opacity duration-200", !isMobile && !open ? "opacity-0" : "opacity-100")}>
              Calm control for your OpenClaw dashboard.
            </p>
          </div>
          <div className="flex shrink-0 items-center gap-2">
            <SidebarTrigger className="hidden lg:inline-flex" />
            <SidebarClose />
          </div>
        </div>
      </SidebarHeader>

      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Navigation</SidebarGroupLabel>
          <SidebarMenu>{renderedNav}</SidebarMenu>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter>
        <ThemeToggle compact={!isMobile && !open} />
      </SidebarFooter>
    </Sidebar>
  );
}

export function AppShell({ pathname, children }: AppShellProps) {
  const [sidebarOpen, setSidebarOpen] = useState(() => {
    if (typeof window === "undefined") {
      return true;
    }
    return window.localStorage.getItem(SIDEBAR_PREFERENCE_KEY) !== "true";
  });

  useEffect(() => {
    if (typeof window === "undefined") {
      return;
    }
    window.localStorage.setItem(SIDEBAR_PREFERENCE_KEY, sidebarOpen ? "false" : "true");
  }, [sidebarOpen]);

  return (
    <SidebarProvider open={sidebarOpen} onOpenChange={setSidebarOpen}>
      <div className="min-h-screen w-full bg-[var(--color-surface-base)] text-[var(--color-text-default)]">
        <a href="#main-content" className="skip-link">
          Skip to main content
        </a>

        <div className="flex min-h-screen w-full">
          <AppSidebar pathname={pathname} />

          <SidebarInset>
            <header className="sticky top-0 z-30 flex items-center justify-between gap-3 border-b border-[var(--color-border-default)] bg-[color-mix(in_srgb,var(--color-surface-card)_88%,transparent)] px-[var(--page-gutter)] py-4 backdrop-blur lg:hidden">
              <div className="flex items-center gap-3">
                <SidebarTrigger />
                <div>
                  <p className="text-[0.7rem] font-semibold uppercase tracking-[0.35em] text-[var(--color-text-muted)]">
                    Clawboard
                  </p>
                  <p className="text-sm font-semibold text-[var(--color-text-strong)]">Daily Companion</p>
                </div>
              </div>
            </header>

            <main id="main-content" tabIndex={-1} className="flex-1 px-[var(--page-gutter)] py-[var(--page-gutter)]">
              <div className="flex min-h-full w-full flex-col gap-[var(--panel-gap)]">{children}</div>
            </main>
          </SidebarInset>
        </div>
      </div>
    </SidebarProvider>
  );
}
