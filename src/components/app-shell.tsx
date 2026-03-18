import Link from "next/link";
import { BotMessageSquare, Cable, House, ScrollText, Settings2, Sparkles, Wrench } from "lucide-react";

import { cn } from "@/lib/utils";
import { ThemeToggle } from "@/components/theme-toggle";

const navItems = [
  { href: "/", label: "Home", icon: House },
  { href: "/chat", label: "Chat", icon: BotMessageSquare },
  { href: "/skills", label: "Skills", icon: Sparkles },
  { href: "/jobs", label: "Jobs", icon: Wrench },
  { href: "/outputs", label: "Outputs", icon: ScrollText },
  { href: "/connections", label: "Connections", icon: Cable },
  { href: "/settings", label: "Settings", icon: Settings2 },
];

export function AppShell({
  pathname,
  children,
}: {
  pathname: string;
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen w-full">
      <a href="#main-content" className="skip-link">
        Skip to main content
      </a>

      <div className="flex min-h-screen w-full flex-col gap-[var(--panel-gap)] px-[var(--page-gutter)] py-[var(--page-gutter)] lg:flex-row lg:items-start">
        <aside
          className="surface-card flex w-full flex-col gap-8 p-5 lg:w-72 lg:sticky lg:top-[var(--page-gutter)]"
          aria-label="Primary"
        >
          <div className="space-y-1">
            <p className="text-xs font-semibold uppercase tracking-[0.4em] text-[var(--color-text-muted)]">Clawboard</p>
            <h1 className="text-lg font-semibold text-[var(--color-text-strong)]">Daily Companion</h1>
            <p className="text-sm text-[var(--color-text-muted)]">Clear, calm, and ready to help.</p>
          </div>

          <nav className="space-y-1" aria-label="Main navigation">
            {navItems.map((item) => {
              const active = pathname === item.href || pathname.startsWith(`${item.href}/`);
              const Icon = item.icon;

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  aria-current={active ? "page" : undefined}
                  className={cn(
                    "flex items-center gap-3 rounded-[var(--radius-md)] px-3 py-2 text-sm font-semibold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-focus-ring)] focus-visible:ring-offset-0",
                    active
                      ? "bg-[var(--color-accent-muted)] text-[var(--color-accent-foreground)]"
                      : "text-[var(--color-text-muted)] hover:bg-[var(--color-surface-muted)] hover:text-[var(--color-text-strong)]",
                  )}
                >
                  <Icon className="size-4 text-inherit" aria-hidden="true" />
                  <span>{item.label}</span>
                </Link>
              );
            })}
          </nav>

          <div className="mt-auto border-t border-[var(--color-border-default)] pt-4">
            <ThemeToggle />
          </div>
        </aside>

        <main id="main-content" tabIndex={-1} className="min-w-0 flex-1">
          {children}
        </main>
      </div>
    </div>
  );
}
