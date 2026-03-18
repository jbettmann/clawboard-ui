import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "interactive-panel inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-[var(--radius-md)] border border-transparent text-sm font-semibold transition-base disabled:pointer-events-none disabled:opacity-50 outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-focus-ring)] focus-visible:ring-offset-0 active:translate-y-px",
  {
    variants: {
      variant: {
        default:
          "bg-[var(--color-accent-primary)] text-[var(--color-surface-card)] shadow-[var(--shadow-soft)] hover:brightness-105 hover:shadow-[var(--shadow-card)]",
        secondary:
          "border border-[var(--color-border-default)] bg-[color-mix(in_srgb,var(--color-surface-muted)_86%,transparent)] text-[var(--color-text-strong)] hover:border-[var(--color-border-strong)] hover:bg-[var(--color-surface-card)]",
        ghost:
          "text-[var(--color-text-muted)] hover:bg-[var(--color-surface-muted)] hover:text-[var(--color-text-strong)]",
      },
  size: {
    default: "h-10 px-4 py-2",
    sm: "h-8 rounded-[calc(var(--radius-md)-0.2rem)] px-3 text-[0.82rem]",
    lg: "h-11 px-5 text-[0.95rem]",
    icon: "gap-0 h-10 w-10 rounded-[var(--radius-md)] px-0 text-lg",
  },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  },
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(({ className, variant, size, asChild = false, ...props }, ref) => {
  const Comp = asChild ? Slot : "button";
  return <Comp className={cn(buttonVariants({ variant, size, className }))} ref={ref} {...props} />;
});
Button.displayName = "Button";

export { Button, buttonVariants };
