"use client";

import * as React from "react";
import { PanelLeft, X } from "lucide-react";

import { cn } from "@/lib/utils";

type SidebarContextValue = {
  open: boolean;
  setOpen: (open: boolean) => void;
  openMobile: boolean;
  setOpenMobile: (open: boolean) => void;
  isMobile: boolean;
  toggleSidebar: () => void;
};

const SidebarContext = React.createContext<SidebarContextValue | null>(null);

function useSidebar() {
  const context = React.useContext(SidebarContext);
  if (!context) {
    throw new Error("useSidebar must be used within a SidebarProvider.");
  }
  return context;
}

type SidebarProviderProps = {
  children: React.ReactNode;
  defaultOpen?: boolean;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
};

function SidebarProvider({
  children,
  defaultOpen = true,
  open: openProp,
  onOpenChange,
}: SidebarProviderProps) {
  const [uncontrolledOpen, setUncontrolledOpen] = React.useState(defaultOpen);
  const [openMobile, setOpenMobile] = React.useState(false);
  const [isMobile, setIsMobile] = React.useState(false);

  React.useEffect(() => {
    const media = window.matchMedia("(max-width: 1023px)");
    const handleChange = (event: MediaQueryList | MediaQueryListEvent) => {
      setIsMobile(event.matches);
    };

    handleChange(media);

    if (media.addEventListener) {
      media.addEventListener("change", handleChange);
      return () => media.removeEventListener("change", handleChange);
    }

    media.addListener(handleChange);
    return () => media.removeListener(handleChange);
  }, []);

  const open = openProp ?? uncontrolledOpen;
  const setOpen = React.useCallback(
    (nextOpen: boolean) => {
      if (onOpenChange) {
        onOpenChange(nextOpen);
        return;
      }
      setUncontrolledOpen(nextOpen);
    },
    [onOpenChange],
  );

  const toggleSidebar = React.useCallback(() => {
    if (isMobile) {
      setOpenMobile((value) => !value);
      return;
    }
    setOpen(!open);
  }, [isMobile, open, setOpen]);

  const value = React.useMemo(
    () => ({ open, setOpen, openMobile, setOpenMobile, isMobile, toggleSidebar }),
    [open, setOpen, openMobile, isMobile, toggleSidebar],
  );

  return <SidebarContext.Provider value={value}>{children}</SidebarContext.Provider>;
}

function Sidebar({ className, children }: React.ComponentProps<"aside">) {
  const { open, openMobile, setOpenMobile, isMobile } = useSidebar();

  if (isMobile) {
    return (
      <>
        {openMobile ? (
          <div className="fixed inset-0 z-50 flex lg:hidden">
            <button
              type="button"
              className="absolute inset-0 bg-slate-950/45"
              aria-label="Close navigation"
              onClick={() => setOpenMobile(false)}
            />
            <aside
              className={cn(
                "relative z-10 flex h-full w-72 flex-col border-r border-[var(--color-border-default)] bg-[var(--color-surface-card)] shadow-2xl",
                className,
              )}
            >
              {children}
            </aside>
          </div>
        ) : null}
      </>
    );
  }

  return (
    <aside
      data-state={open ? "expanded" : "collapsed"}
      className={cn(
        "hidden shrink-0 border-r border-[var(--color-border-default)] bg-[var(--color-surface-card)] transition-[width] duration-200 lg:flex lg:flex-col",
        open ? "lg:w-72" : "lg:w-20",
        className,
      )}
    >
      {children}
    </aside>
  );
}

function SidebarHeader({ className, ...props }: React.ComponentProps<"div">) {
  return <div className={cn("flex flex-col gap-4 border-b border-[var(--color-border-default)] p-4", className)} {...props} />;
}

function SidebarContent({ className, ...props }: React.ComponentProps<"div">) {
  return <div className={cn("flex flex-1 flex-col gap-4 overflow-y-auto p-4", className)} {...props} />;
}

function SidebarFooter({ className, ...props }: React.ComponentProps<"div">) {
  return <div className={cn("border-t border-[var(--color-border-default)] p-4", className)} {...props} />;
}

function SidebarGroup({ className, ...props }: React.ComponentProps<"div">) {
  return <div className={cn("flex flex-col gap-2", className)} {...props} />;
}

function SidebarGroupLabel({ className, ...props }: React.ComponentProps<"div">) {
  const { open, isMobile } = useSidebar();
  return (
    <div
      className={cn(
        "px-2 text-[0.7rem] font-semibold uppercase tracking-[0.3em] text-[var(--color-text-muted)] transition-opacity duration-200",
        !isMobile && !open ? "opacity-0" : "opacity-100",
        className,
      )}
      {...props}
    />
  );
}

function SidebarMenu({ className, ...props }: React.ComponentProps<"ul">) {
  return <ul className={cn("flex flex-col gap-1", className)} {...props} />;
}

function SidebarMenuItem({ className, ...props }: React.ComponentProps<"li">) {
  return <li className={cn("list-none", className)} {...props} />;
}

type SidebarMenuButtonProps = React.ComponentProps<"button"> & {
  asChild?: boolean;
  isActive?: boolean;
  tooltip?: string;
};

function SidebarMenuButton({ className, asChild, isActive, tooltip, ...props }: SidebarMenuButtonProps) {
  const { open, isMobile } = useSidebar();
  const Comp = asChild ? React.Fragment : "button";
  const content = asChild ? (
    React.Children.only(props.children)
  ) : (
    <button
      data-slot="sidebar-menu-button"
      className={cn(
        "flex w-full items-center gap-3 rounded-2xl px-3 py-2 text-sm font-semibold transition-colors outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-focus-ring)]",
        isActive
          ? "bg-[var(--color-accent-muted)] text-[var(--color-accent-foreground)]"
          : "text-[var(--color-text-muted)] hover:bg-[var(--color-surface-muted)] hover:text-[var(--color-text-strong)]",
        className,
      )}
      title={!isMobile && !open ? tooltip : undefined}
      {...props}
    />
  );

  if (Comp === React.Fragment) {
    const child = content as React.ReactElement<{ className?: string; title?: string }>;
    return React.cloneElement(child, {
      className: cn(
        "flex w-full items-center gap-3 rounded-2xl px-3 py-2 text-sm font-semibold transition-colors outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-focus-ring)]",
        isActive
          ? "bg-[var(--color-accent-muted)] text-[var(--color-accent-foreground)]"
          : "text-[var(--color-text-muted)] hover:bg-[var(--color-surface-muted)] hover:text-[var(--color-text-strong)]",
        child.props.className,
      ),
      title: !isMobile && !open ? tooltip : child.props.title,
    });
  }

  return content;
}

function SidebarTrigger({ className, ...props }: React.ComponentProps<"button">) {
  const { isMobile, open, toggleSidebar, setOpenMobile } = useSidebar();
  return (
    <button
      type="button"
      aria-label={isMobile ? "Open navigation" : open ? "Collapse navigation" : "Expand navigation"}
      className={cn(
        "inline-flex h-10 w-10 items-center justify-center rounded-xl border border-[var(--color-border-default)] bg-[var(--color-surface-muted)] text-[var(--color-text-muted)] transition-colors hover:border-[var(--color-border-strong)] hover:text-[var(--color-text-strong)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-focus-ring)]",
        className,
      )}
      onClick={() => {
        if (isMobile) {
          setOpenMobile(true);
          return;
        }
        toggleSidebar();
      }}
      {...props}
    >
      <PanelLeft className="size-4" />
    </button>
  );
}

function SidebarClose({ className, ...props }: React.ComponentProps<"button">) {
  const { setOpenMobile } = useSidebar();
  return (
    <button
      type="button"
      aria-label="Close navigation"
      className={cn(
        "inline-flex h-9 w-9 items-center justify-center rounded-full border border-[var(--color-border-default)] bg-[var(--color-surface-muted)] text-[var(--color-text-muted)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-focus-ring)] lg:hidden",
        className,
      )}
      onClick={() => setOpenMobile(false)}
      {...props}
    >
      <X className="size-4" />
    </button>
  );
}

function SidebarInset({ className, ...props }: React.ComponentProps<"div">) {
  return <div className={cn("flex min-h-screen flex-1 flex-col bg-[var(--color-surface-base)]", className)} {...props} />;
}

export {
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
};
