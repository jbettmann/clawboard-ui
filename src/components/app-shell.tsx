"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { BotMessageSquare, Cable, House, ScrollText, Settings2, Sparkles, Wrench } from "lucide-react";

import { ThemeToggle } from "@/components/theme-toggle";
import {
  Sidebar,
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
        const Icon = item.icon;
        const active = pathname === item.href || pathname.startsWith(`${item.href}/`);
        return (
          <SidebarMenuItem key={item.href}>
            <SidebarMenuButton
              asChild
              isActive={active}
              tooltip={item.label}
              className="justify-start"
            >
              <Link href={item.href} onClick={() => isMobile && setOpenMobile(false)}>
                <Icon className="size-5 shrink-0" aria-hidden="true" />
                <span
                  className={cn(
                    "ml-2 truncate transition-opacity duration-200",
                    !isMobile && !open ? "opacity-0" : "opacity-100",
                  )}
                >
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
        <div
          className={cn(
            "flex flex-col gap-1",
            !isMobile && !open ? "items-center" : "",
          )}
        >
          <p className="text-[0.65rem] uppercase tracking-[0.45em] text-[var(--color-text-muted)]">Clawboard</p>
          <h1
            className={cn(
              "text-lg font-semibold tracking-tight text-[var(--color-text-strong)] transition-opacity duration-200",
              !isMobile && !open ? "opacity-0" : "opacity-100",
            )}
          >
            Daily Companion
          </h1>
          <p
            className={cn(
              "text-sm leading-6 text-[var(--color-text-soft)] transition-opacity duration-200",
              !isMobile && !open ? "opacity-0" : "opacity-100",
            )}
          >
            Calm control for your OpenClaw dashboard.
          </p>
        </div>
      </SidebarHeader>

      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Navigation</SidebarGroupLabel>
          <nav aria-label="Primary navigation">
            <SidebarMenu>{renderedNav}</SidebarMenu>
          </nav>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter>
        <p className="text-[0.65rem] uppercase tracking-[0.4em] text-[var(--color-text-muted)]">Calm Control</p>
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
            <div className="flex min-h-screen w-full flex-col">
              <header className="sticky top-0 z-30 border-b border-[var(--color-border-default)] bg-[color-mix(in_srgb,var(--color-surface-overlay)_92%,var(--color-surface-base))] backdrop-blur-xl shadow-[0_12px_40px_-28px_rgba(15,23,42,0.8)]">
                <div className="mx-auto flex w-full max-w-6xl items-center justify-between px-[var(--page-gutter)] py-3">
                  <div className="flex items-center gap-3">
                    <SidebarTrigger />
                    <div>
                      <p className="text-[0.65rem] uppercase tracking-[0.45em] text-[var(--color-text-muted)]">Clawboard</p>
                      <p className="text-base font-semibold text-[var(--color-text-strong)]">Daily Companion</p>
                    </div>
                  </div>
                  <ThemeToggle />
                </div>
              </header>

              <main
                id="main-content"
                tabIndex={-1}
                className="min-h-[calc(100vh-68px)] flex-1 w-full px-[var(--page-gutter)] py-[var(--page-gutter)]"
              >
                <div className="mx-auto flex w-full max-w-6xl flex-col gap-[var(--panel-gap)]">{children}</div>
              </main>
            </div>
          </SidebarInset>
        </div>
      </div>
    </SidebarProvider>
  );
}
