"use client";

import { Moon, Sun } from "lucide-react";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useThemePreference } from "@/lib/theme";

export function ThemeToggle({ className }: { className?: string }) {
  const { resolvedTheme, setPreference } = useThemePreference();
  const nextTheme = resolvedTheme === "dark" ? "light" : "dark";
  const Icon = resolvedTheme === "dark" ? Sun : Moon;

  return (
    <Button
      variant="ghost"
      size="icon"
      className={cn("text-[var(--color-text-muted)]", className)}
      onClick={() => setPreference(nextTheme)}
      aria-label={`Switch to ${nextTheme} mode`}
      aria-pressed={resolvedTheme === "dark"}
    >
      <Icon className="size-5" aria-hidden="true" />
    </Button>
  );
}
