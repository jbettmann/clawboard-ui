import Link from "next/link";
import { BotMessageSquare, Cable, House, ScrollText, Settings2, Sparkles, Wrench } from "lucide-react";

import { cn } from "@/lib/utils";

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
    <div className="min-h-screen bg-zinc-100/70 dark:bg-zinc-950">
      <div className="mx-auto flex max-w-7xl flex-col gap-4 px-4 py-4 md:flex-row md:px-6 md:py-6">
        <aside className="w-full rounded-2xl border border-zinc-200/80 bg-white/90 p-4 shadow-sm md:sticky md:top-6 md:h-[calc(100vh-3rem)] md:w-72 dark:border-zinc-800/80 dark:bg-zinc-900/80">
          <div className="px-2 pb-4">
            <p className="text-xs font-medium uppercase tracking-[0.22em] text-zinc-500">Clawboard</p>
            <h1 className="mt-2 text-lg font-semibold text-zinc-900 dark:text-zinc-50">Daily Companion</h1>
            <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">Clear, calm, and ready to help.</p>
          </div>

          <nav className="space-y-1">
            {navItems.map((item) => {
              const active = pathname === item.href || pathname.startsWith(`${item.href}/`);
              const Icon = item.icon;

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    "flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition-colors",
                    active
                      ? "bg-zinc-900 text-zinc-50 dark:bg-zinc-100 dark:text-zinc-900"
                      : "text-zinc-700 hover:bg-zinc-100 dark:text-zinc-300 dark:hover:bg-zinc-800",
                  )}
                >
                  <Icon className="size-4" />
                  <span>{item.label}</span>
                </Link>
              );
            })}
          </nav>
        </aside>

        <main className="min-w-0 flex-1">{children}</main>
      </div>
    </div>
  );
}
