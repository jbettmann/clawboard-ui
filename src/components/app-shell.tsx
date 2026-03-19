"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import {
  BotMessageSquare,
  Cable,
  HelpCircle,
  House,
  MessageCircle,
  Pin,
  PinOff,
  ScrollText,
  Settings2,
  Sparkles,
  Wrench,
} from "lucide-react";

import { ThemeToggle } from "@/components/theme-toggle";
import { Button } from "@/components/ui/button";
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
const SIDEBAR_PINNED_KEY = "clawboard-ui-sidebar-pinned";
const SIDEBAR_RECENT_KEY = "clawboard-ui-sidebar-recents";
const RECENT_LIMIT = 6;

const navItems = [
  { href: "/", label: "Home", icon: House },
  { href: "/chat", label: "Chat", icon: BotMessageSquare },
  { href: "/skills", label: "Skills", icon: Sparkles },
  { href: "/jobs", label: "Jobs", icon: Wrench },
  { href: "/outputs", label: "Outputs", icon: ScrollText },
  { href: "/connections", label: "Connections", icon: Cable },
  { href: "/settings", label: "Settings", icon: Settings2 },
];

type NavItem = (typeof navItems)[number];

const parseDestinationList = (value?: string | null) => {
  if (!value) {
    return [];
  }
  try {
    const parsed = JSON.parse(value);
    if (Array.isArray(parsed)) {
      return parsed.filter((item): item is string => typeof item === "string");
    }
  } catch {
    // ignore invalid storage entries
  }
  return [];
};

const findNavItemFromPath = (path: string) =>
  navItems.find((item) => path === item.href || path.startsWith(`${item.href}/`));

type SidebarDestinationItemProps = {
  item: NavItem;
  isActive: boolean;
  isPinned: boolean;
  onPinToggle: (href: string) => void;
  onNavigate: () => void;
  isSidebarOpen: boolean;
  isMobile: boolean;
};

function SidebarDestinationItem({
  item,
  isActive,
  isPinned,
  onPinToggle,
  onNavigate,
  isSidebarOpen,
  isMobile,
}: SidebarDestinationItemProps) {
  const Icon = item.icon;
  return (
    <SidebarMenuItem className="flex items-center gap-2">
      <SidebarMenuButton
        asChild
        isActive={isActive}
        tooltip={item.label}
        className="flex-1 gap-2 pr-3"
      >
        <Link href={item.href} onClick={onNavigate} aria-current={isActive ? "page" : undefined}>
          <Icon className="size-5 shrink-0" aria-hidden="true" />
          <span
            className={cn(
              "ml-2 truncate transition-opacity duration-200",
              !isMobile && !isSidebarOpen ? "opacity-0" : "opacity-100",
            )}
          >
            {item.label}
          </span>
        </Link>
      </SidebarMenuButton>
      <Button
        variant="ghost"
        size="icon"
        type="button"
        className="text-[var(--color-text-muted)]"
        aria-label={isPinned ? `Unpin ${item.label}` : `Pin ${item.label}`}
        aria-pressed={isPinned}
        onClick={(event) => {
          event.preventDefault();
          event.stopPropagation();
          onPinToggle(item.href);
        }}
      >
        {isPinned ? (
          <Pin className="size-4" aria-hidden="true" />
        ) : (
          <PinOff className="size-4" aria-hidden="true" />
        )}
      </Button>
    </SidebarMenuItem>
  );
}

type AppShellProps = {
  pathname: string;
  children: React.ReactNode;
};

function AppSidebar({ pathname }: { pathname: string }) {
  const { open, isMobile, setOpenMobile } = useSidebar();
  const [pinnedDestinations, setPinnedDestinations] = useState<string[]>([]);
  const [recentDestinations, setRecentDestinations] = useState<string[]>([]);
  const [hydrated, setHydrated] = useState(false);

  const navItemByHref = useMemo(
    () => new Map(navItems.map((item) => [item.href, item])),
    [],
  );
  const activeNavItem = useMemo(() => findNavItemFromPath(pathname), [pathname]);

  useEffect(() => {
    if (typeof window === "undefined") {
      return;
    }
    const storedPinned = parseDestinationList(
      window.localStorage.getItem(SIDEBAR_PINNED_KEY),
    );
    const storedRecents = parseDestinationList(
      window.localStorage.getItem(SIDEBAR_RECENT_KEY),
    );
    const filteredPinned = storedPinned.filter((href) => navItemByHref.has(href));
    const filteredRecents = storedRecents.filter((href) => navItemByHref.has(href));
    const frame = window.requestAnimationFrame(() => {
      setPinnedDestinations(filteredPinned);
      setRecentDestinations(filteredRecents);
      setHydrated(true);
    });
    return () => window.cancelAnimationFrame(frame);
  }, [navItemByHref]);

  useEffect(() => {
    if (!hydrated || typeof window === "undefined") {
      return;
    }
    window.localStorage.setItem(
      SIDEBAR_PINNED_KEY,
      JSON.stringify(pinnedDestinations),
    );
  }, [hydrated, pinnedDestinations]);

  useEffect(() => {
    if (!hydrated || typeof window === "undefined") {
      return;
    }
    window.localStorage.setItem(
      SIDEBAR_RECENT_KEY,
      JSON.stringify(recentDestinations),
    );
  }, [hydrated, recentDestinations]);

  useEffect(() => {
    if (!hydrated || typeof window === "undefined") {
      return;
    }
    const match = findNavItemFromPath(pathname);
    if (!match) {
      return;
    }
    const frame = window.requestAnimationFrame(() => {
      setRecentDestinations((current) => {
        if (current[0] === match.href) {
          return current;
        }
        const next = [match.href, ...current.filter((href) => href !== match.href)];
        return next.slice(0, RECENT_LIMIT);
      });
    });
    return () => window.cancelAnimationFrame(frame);
  }, [hydrated, pathname]);

  const closeOnNavigate = () => {
    if (isMobile) {
      setOpenMobile(false);
    }
  };

  const togglePin = (href: string) => {
    setPinnedDestinations((current) => {
      if (current.includes(href)) {
        return current.filter((entry) => entry !== href);
      }
      return [href, ...current];
    });
  };

  const pinnedItems = useMemo(
    () =>
      pinnedDestinations
        .map((href) => navItemByHref.get(href))
        .filter((item): item is NavItem => Boolean(item)),
    [navItemByHref, pinnedDestinations],
  );

  const recentItems = useMemo(
    () =>
      recentDestinations
        .map((href) => navItemByHref.get(href))
        .filter(
          (item): item is NavItem =>
            item !== undefined && !pinnedDestinations.includes(item.href),
        ),
    [navItemByHref, recentDestinations, pinnedDestinations],
  );

  const ActiveIcon = activeNavItem ? activeNavItem.icon : House;
  const activeLabel = activeNavItem ? activeNavItem.label : "Daily Companion";

  return (
    <Sidebar>
      <SidebarHeader>
        <div
          className={cn(
            "flex flex-col gap-1",
            !isMobile && !open ? "items-center" : "",
          )}
        >
          <p className="text-[0.65rem] uppercase tracking-[0.45em] text-[var(--color-text-muted)]">
            Clawboard
          </p>
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

        <div
          className={cn(
            "mt-3 flex items-center gap-2 text-[0.65rem] uppercase tracking-[0.35em] text-[var(--color-text-muted)]",
            !isMobile && !open ? "justify-center" : "",
          )}
        >
          <ActiveIcon className="size-4" aria-hidden="true" />
          <div className="space-y-1">
            <p className="text-[0.55rem]">Active view</p>
            <p
              className={cn(
                "text-sm font-semibold text-[var(--color-text-strong)] transition-opacity duration-200",
                !isMobile && !open ? "opacity-0" : "opacity-100",
              )}
            >
              {activeLabel}
            </p>
          </div>
        </div>
      </SidebarHeader>

      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Pinned</SidebarGroupLabel>
          {pinnedItems.length ? (
            <SidebarMenu aria-label="Pinned destinations">
              {pinnedItems.map((item) => (
                <SidebarDestinationItem
                  key={item.href}
                  item={item}
                  isActive={activeNavItem?.href === item.href}
                  isPinned
                  onPinToggle={togglePin}
                  onNavigate={closeOnNavigate}
                  isSidebarOpen={open}
                  isMobile={isMobile}
                />
              ))}
            </SidebarMenu>
          ) : (
            <p className="px-3 text-[0.65rem] text-[var(--color-text-muted)]">
              Pin a destination to make it stick near the top.
            </p>
          )}
        </SidebarGroup>

        <SidebarGroup>
          <SidebarGroupLabel>Navigation</SidebarGroupLabel>
          <nav aria-label="Primary navigation">
            <SidebarMenu>
              {navItems.map((item) => (
                <SidebarDestinationItem
                  key={item.href}
                  item={item}
                  isActive={activeNavItem ? activeNavItem.href === item.href : false}
                  isPinned={pinnedDestinations.includes(item.href)}
                  onPinToggle={togglePin}
                  onNavigate={closeOnNavigate}
                  isSidebarOpen={open}
                  isMobile={isMobile}
                />
              ))}
            </SidebarMenu>
          </nav>
        </SidebarGroup>

        <SidebarGroup>
          <SidebarGroupLabel>Recent views</SidebarGroupLabel>
          {recentItems.length ? (
            <SidebarMenu aria-label="Recent destinations">
              {recentItems.map((item) => (
                <SidebarDestinationItem
                  key={item.href}
                  item={item}
                  isActive={activeNavItem ? activeNavItem.href === item.href : false}
                  isPinned={pinnedDestinations.includes(item.href)}
                  onPinToggle={togglePin}
                  onNavigate={closeOnNavigate}
                  isSidebarOpen={open}
                  isMobile={isMobile}
                />
              ))}
            </SidebarMenu>
          ) : (
            <p className="px-3 text-[0.65rem] text-[var(--color-text-muted)]">
              Recent destinations appear here as you move through Clawboard.
            </p>
          )}
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter>
        <p className="text-[0.65rem] uppercase tracking-[0.4em] text-[var(--color-text-muted)]">
          Calm Control
        </p>
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

                  <div className="flex items-center gap-2">
                    <Button
                      variant="ghost"
                      size="icon"
                      asChild
                      className="text-[var(--color-text-muted)]"
                      aria-label="Open Clawboard docs"
                    >
                      <a href="https://openclaw.com/docs" target="_blank" rel="noreferrer">
                        <HelpCircle className="size-5" aria-hidden="true" />
                      </a>
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      asChild
                      className="text-[var(--color-text-muted)]"
                      aria-label="Send feedback"
                    >
                      <a href="mailto:feedback@openclaw.com">
                        <MessageCircle className="size-5" aria-hidden="true" />
                      </a>
                    </Button>
                    <ThemeToggle />
                  </div>
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
