"use client";

import * as React from "react";

import { cn } from "@/lib/utils";

const skeletonBase =
  "pointer-events-none rounded-md bg-[color-mix(in_srgb,var(--color-surface-muted)_40%,transparent)] animate-pulse";

export function Skeleton({ className, ...props }: React.ComponentPropsWithoutRef<"div">) {
  return <div className={cn(skeletonBase, className)} {...props} />;
}
