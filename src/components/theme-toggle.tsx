"use client";

import { cn } from "@/lib/utils";
import { ThemePreference, useThemePreference } from "@/lib/theme";

const toggleOptions: Array<{ label: string; value: ThemePreference; shortLabel: string }> = [
  { label: "Light", shortLabel: "L", value: "light" },
  { label: "System", shortLabel: "S", value: "system" },
  { label: "Dark", shortLabel: "D", value: "dark" },
];

export function ThemeToggle({ compact = false }: { compact?: boolean }) {
  const { preference, resolvedTheme, setPreference } = useThemePreference();

  return (
    <div className="space-y-2 text-[var(--color-text-muted)]">
      <p className={cn("text-xs font-semibold uppercase tracking-[0.4em]", compact && "text-center")}>Theme</p>
      <div className="flex overflow-hidden rounded-full border border-[var(--color-border-default)] bg-[var(--color-surface-muted)] p-1 text-[var(--color-text-muted)]">
        {toggleOptions.map((option) => (
          <button
            key={option.value}
            type="button"
            aria-pressed={preference === option.value}
            aria-label={option.label}
            className={cn(
              "flex-1 rounded-full px-3 py-1.5 text-center text-xs font-semibold transition-base focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-focus-ring)] focus-visible:ring-offset-0",
              preference === option.value
                ? "bg-[var(--color-accent-primary)] text-[var(--color-surface-card)]"
                : "text-[var(--color-text-muted)] hover:text-[var(--color-text-strong)]",
            )}
            onClick={() => setPreference(option.value)}
          >
            {compact ? option.shortLabel : option.label}
          </button>
        ))}
      </div>
      <p className={cn("text-[0.7rem] uppercase tracking-[0.3em]", compact && "text-center")}>
        {resolvedTheme === "dark" ? "Dark mode active" : "Light mode active"}
      </p>
    </div>
  );
}
