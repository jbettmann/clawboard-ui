"use client";

import * as React from "react";
import { createPortal } from "react-dom";
import { X } from "lucide-react";

import { cn } from "@/lib/utils";

const SheetContext = React.createContext<{ onClose?: () => void }>({});

type SheetProps = React.ComponentPropsWithoutRef<"div"> & {
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
};

function Sheet({ open, onOpenChange, children, className, ...props }: SheetProps) {
  if (!open || typeof document === "undefined") {
    return null;
  }

  const handleClose = () => onOpenChange?.(false);

  return createPortal(
    <SheetContext.Provider value={{ onClose: handleClose }}>
      <div
        className={cn("fixed inset-0 z-40 flex items-stretch justify-end", className)}
        {...props}
      >
        <div className="absolute inset-0 bg-black/40 transition-opacity" aria-hidden="true" onClick={handleClose} />
        <div className="relative flex h-full w-full">
          {children}
        </div>
      </div>
    </SheetContext.Provider>,
    document.body,
  );
}

type SheetContentProps = React.ComponentPropsWithoutRef<"div"> & {
  side?: "top" | "right" | "bottom" | "left";
};

function SheetContent({ side = "right", className, children, ...props }: SheetContentProps) {
  const placement = side === "left" ? "mr-auto" : "ml-auto";
  return (
    <div
      className={cn(
        "relative flex h-full w-[var(--sidebar-width)] flex-col bg-[var(--sidebar)] shadow-xl transition-transform duration-200",
        placement,
        className,
      )}
      {...props}
    >
      {children}
    </div>
  );
}

function SheetClose({ className, ...props }: React.ComponentPropsWithoutRef<"button">) {
  const { onClose } = React.useContext(SheetContext);
  return (
    <button
      type="button"
      onClick={onClose}
      className={cn(
        "absolute right-3 top-3 inline-flex h-9 w-9 items-center justify-center rounded-full border border-[var(--color-border-default)] bg-[var(--color-surface-muted)] text-[var(--color-text-muted)] shadow-sm transition hover:border-[var(--color-border-strong)] hover:text-[var(--color-text-strong)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-focus-ring)]",
        className,
      )}
      {...props}
    >
      <X className="size-4" aria-hidden="true" />
      <span className="sr-only">Close</span>
    </button>
  );
}

function SheetHeader({ className, ...props }: React.ComponentProps<"div">) {
  return <div className={cn("flex flex-col gap-1.5 px-4 pt-6", className)} {...props} />;
}

function SheetFooter({ className, ...props }: React.ComponentProps<"div">) {
  return <div className={cn("mt-auto flex flex-col gap-2 px-4 pb-4 pt-2", className)} {...props} />;
}

function SheetTitle({ className, ...props }: React.ComponentProps<"h2">) {
  return <h2 className={cn("text-lg font-semibold text-[var(--color-text-strong)]", className)} {...props} />;
}

function SheetDescription({ className, ...props }: React.ComponentProps<"p">) {
  return <p className={cn("text-sm text-[var(--color-text-muted)]", className)} {...props} />;
}

export { Sheet, SheetContent, SheetClose, SheetDescription, SheetFooter, SheetHeader, SheetTitle };
