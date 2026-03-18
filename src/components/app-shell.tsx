"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import {
  ArrowLeftRight,
  BotMessageSquare,
  Cable,
  House,
  Menu,
  ScrollText,
  Settings2,
  Sparkles,
  Wrench,
  X,
} from "lucide-react";

import { cn } from "@/lib/utils";
import { ThemeToggle } from "@/components/theme-toggle";

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

export function AppShell({ pathname, children }: AppShellProps) {
  const [collapsed, setCollapsed] = useState(() => {
    if (typeof window === "undefined") {
      return false;
    }
    return window.localStorage.getItem(SIDEBAR_PREFERENCE_KEY) === "true";
  });
  const [mobileOpen, setMobileOpen] = useState(false);
  useEffect(() => {
    if (typeof window === "undefined") {
      return;
    }
    window.localStorage.setItem(SIDEBAR_PREFERENCE_KEY, collapsed ? "true" : "false");
  }, [collapsed]);

  const sidebarWidth = collapsed ? "w-20" : "w-72";

  const renderedNav = useMemo(
    () =>
      navItems.map((item) => {
        const active = pathname === item.href || pathname.startsWith(`${item.href}/`);
        const Icon = item.icon;
        return (
          <Link
            key={item.href}
            href={item.href}
            aria-current={active ? "page" : undefined}
            className={cn(
              "group flex items-center gap-3 rounded-2xl px-3 py-2 text-sm font-semibold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-focus-ring)] focus-visible:ring-offset-0",
              active
                ? "bg-[var(--color-accent-muted)] text-[var(--color-accent-foreground)]"
                : "text-[var(--color-text-muted)] hover:bg-[var(--color-surface-muted)] hover:text-[var(--color-text-strong)]",
            )}
          >
            <Icon className="size-5 text-current" aria-hidden="true" />
            <span
              className={cn(
                "transition-opacity duration-200 ease-in-out",
                collapsed ? "opacity-0" : "opacity-100",
              )}
            >
              {item.label}
            </span>
          </Link>
        );
      }),
    [collapsed, pathname],
  );

  return (
    <div className="min-h-screen w-full bg-[var(--color-surface-base)] text-[var(--color-text-default)]">
      <a href="#main-content" className="skip-link">
        Skip to main content
      </a>

      <div className="flex min-h-screen">
        <aside
          className={cn(
            "hidden lg:flex flex-col border-r border-[var(--color-border-default)] bg-[var(--color-surface-card)] px-4 py-6 transition-all duration-200",
            sidebarWidth,
          )}
          aria-label="Primary"
        >
          <div className="flex items-center justify-between gap-2">
            <div className={cn("flex flex-col gap-0.5", collapsed ? "items-center" : "items-start")}>
              <span className="text-xs font-semibold uppercase tracking-[0.4em] text-[var(--color-text-muted)]">
                Clawboard
              </span>
              <p
                className={cn(
                  "text-lg font-semibold text-[var(--color-text-strong)] transition-opacity duration-200",
                  collapsed ? "opacity-0" : "opacity-100",
                )}
              >
                Daily Companion
              </p>
            </div>
            <button
              type="button"
              onClick={() => setCollapsed((prev) => !prev)}
              aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
              className="rounded-full border border-[var(--color-border-default)] bg-[var(--color-surface-muted)] p-2 text-[var(--color-text-muted)] transition-colors hover:text-[var(--color-text-strong)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-focus-ring)] focus-visible:ring-offset-0"
            >
              <ArrowLeftRight className="size-4" />
            </button>
          </div>

          <nav className="mt-6 flex flex-1 flex-col gap-1" aria-label="Main navigation">
            {renderedNav}
          </nav>

          <div className="mt-auto space-y-3">
            <div className="rounded-2xl border border-[var(--color-border-default)] bg-[var(--color-surface-muted)] px-3 py-2 text-xs font-semibold uppercase tracking-[0.3em] text-[var(--color-text-muted)]">
              <p className={collapsed ? "text-center" : ""}>Navigation</p>
            </div>
            <ThemeToggle />
          </div>
        </aside>

        <div className="flex flex-1 flex-col">
          <header className="flex items-center gap-3 border-b border-[var(--color-border-default)] bg-[var(--color-surface-card)] px-[var(--page-gutter)] py-4 lg:hidden">
            <button
              type="button"
              onClick={() => setMobileOpen(true)}
              aria-label="Open menu"
              className="rounded-xl border border-[var(--color-border-default)] bg-[var(--color-surface-muted)] p-2 transition-colors hover:border-[var(--color-border-strong)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-focus-ring)] focus-visible:ring-offset-0"
            >
              <Menu className="size-5" />
            </button>
            <div className="flex flex-col">
              <p className="text-xs uppercase tracking-[0.3em] text-[var(--color-text-muted)]">Clawboard</p>
              <span className="text-sm font-semibold text-[var(--color-text-strong)]">Daily Companion</span>
            </div>
          </header>

          <main id="main-content" tabIndex={-1} className="flex-1 bg-[var(--color-surface-base)]">
            <div className="mx-auto min-h-full max-w-6xl px-[var(--page-gutter)] py-[var(--page-gutter)]">
              {children}
            </div>
          </main>
        </div>
      </div>

      {mobileOpen && (
        <div className="fixed inset-0 z-50 flex lg:hidden">
          <div
            className="absolute inset-0 bg-black/40"
            aria-hidden="true"
            onClick={() => setMobileOpen(false)}
          />
          <aside className="relative z-10 flex w-64 flex-col border border-[var(--color-border-default)] bg-[var(--color-surface-card)] px-5 py-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-semibold text-[var(--color-text-strong)]">Clawboard</p>
                <p className="text-xs uppercase tracking-[0.3em] text-[var(--color-text-muted)]">Daily Companion</p>
              </div>
              <button
                type="button"
                onClick={() => setMobileOpen(false)}
                aria-label="Close menu"
                className="rounded-full border border-[var(--color-border-default)] bg-[var(--color-surface-muted)] p-2 text-[var(--color-text-muted)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-focus-ring)] focus-visible:ring-offset-0"
              >
                <X className="size-4" />
              </button>
            </div>
            <nav className="mt-8 flex flex-1 flex-col gap-1" aria-label="Main navigation">
              {renderedNav}
            </nav>
            <div className="mt-auto">
              <ThemeToggle />
            </div>
          </aside>
        </div>
      )}
    </div>
  );
}
