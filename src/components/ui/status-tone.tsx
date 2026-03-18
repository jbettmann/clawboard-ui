import { cn } from "@/lib/utils";

export type StatusTone = "good" | "watch" | "neutral";

export function statusTonePanelClass(tone: StatusTone) {
  if (tone === "good") {
    return "border-[color-mix(in_srgb,var(--color-state-good)_28%,var(--color-border-default))] bg-[color-mix(in_srgb,var(--color-state-good)_10%,var(--color-surface-card))] text-[var(--color-text-strong)]";
  }
  if (tone === "watch") {
    return "border-[color-mix(in_srgb,var(--color-state-watch)_30%,var(--color-border-default))] bg-[color-mix(in_srgb,var(--color-state-watch)_10%,var(--color-surface-card))] text-[var(--color-text-strong)]";
  }
  return "border-[var(--color-border-default)] bg-[var(--color-surface-muted)] text-[var(--color-text-strong)]";
}

export function statusToneTextClass(tone: StatusTone) {
  if (tone === "good") return "text-[var(--color-state-good)]";
  if (tone === "watch") return "text-[var(--color-state-watch)]";
  return "text-[var(--color-text-muted)]";
}

export function StatusTonePanel({
  tone,
  className,
  children,
}: {
  tone: StatusTone;
  className?: string;
  children: React.ReactNode;
}) {
  return <div className={cn("rounded-2xl border p-4", statusTonePanelClass(tone), className)}>{children}</div>;
}
