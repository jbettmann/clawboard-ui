"use client";

import * as React from "react";

import { cn } from "@/lib/utils";

export function Separator({ className, ...props }: React.ComponentPropsWithoutRef<"div">) {
  return <div className={cn("w-full border-t border-[var(--color-border-default)]", className)} {...props} />;
}
