"use client";

import * as React from "react";

import { cn } from "@/lib/utils";

const TooltipContext = React.createContext<{ isOpen: boolean; setIsOpen: (open: boolean) => void } | null>(null);

function useTooltipContext() {
  const context = React.useContext(TooltipContext);
  if (!context) {
    throw new Error("Tooltip components must be rendered within a Tooltip");
  }
  return context;
}

export function Tooltip({ children }: { children: React.ReactNode }) {
  const [isOpen, setIsOpen] = React.useState(false);
  const value = React.useMemo(() => ({ isOpen, setIsOpen }), [isOpen]);
  return <TooltipContext.Provider value={value}>{children}</TooltipContext.Provider>;
}

export function TooltipTrigger({
  children,
  asChild = false,
  className,
  ...props
}: React.ComponentPropsWithoutRef<"span"> & { asChild?: boolean }) {
  const { setIsOpen } = useTooltipContext();
  const show = () => setIsOpen(true);
  const hide = () => setIsOpen(false);

  if (asChild) {
    const child = React.Children.only(children) as React.ReactElement<Record<string, unknown>>;
    const childProps = child.props as {
      className?: string;
      onMouseEnter?: (...args: unknown[]) => void;
      onMouseLeave?: (...args: unknown[]) => void;
      onFocus?: (...args: unknown[]) => void;
      onBlur?: (...args: unknown[]) => void;
    };

    return React.cloneElement(child, {
      className: cn(childProps.className, className),
      onMouseEnter: (...args: unknown[]) => {
        show();
        childProps.onMouseEnter?.(...args);
      },
      onMouseLeave: (...args: unknown[]) => {
        hide();
        childProps.onMouseLeave?.(...args);
      },
      onFocus: (...args: unknown[]) => {
        show();
        childProps.onFocus?.(...args);
      },
      onBlur: (...args: unknown[]) => {
        hide();
        childProps.onBlur?.(...args);
      },
      ...props,
    });
  }

  return (
    <span
      className={cn("inline-flex", className)}
      onMouseEnter={show}
      onMouseLeave={hide}
      onFocus={show}
      onBlur={hide}
      {...props}
    >
      {children}
    </span>
  );
}

export const TooltipContent = React.forwardRef<HTMLDivElement, React.ComponentPropsWithoutRef<"div"> & { hidden?: boolean }>(
  ({ children, className, hidden, ...props }, ref) => {
    const { isOpen } = useTooltipContext();
    if (hidden || !isOpen) {
      return null;
    }

    return (
      <div
        ref={ref}
        role="tooltip"
        className={cn(
          "absolute z-50 rounded-md border border-[var(--color-border-default)] bg-[var(--color-surface-card)] px-3 py-1.5 text-xs text-[var(--color-text-muted)] shadow-[var(--shadow-soft)]",
          className,
        )}
        {...props}
      >
        {children}
      </div>
    );
  },
);
TooltipContent.displayName = "TooltipContent";
