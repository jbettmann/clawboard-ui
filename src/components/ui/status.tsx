import {
  AlertCircle,
  AlertTriangle,
  CheckCircle2,
  CircleDashed,
  Loader2,
  Sparkles,
  TriangleAlert,
  type LucideIcon,
} from "lucide-react";
import type { ReactNode } from "react";

import { cn } from "@/lib/utils";
import type { StatusVariant } from "@/lib/status-grammar";

type StatusMeta = {
  label: string;
  panelBorder: string;
  panelBg: string;
  badgeBorder: string;
  badgeBg: string;
  text: string;
  Icon: LucideIcon;
};

const STATUS_META: Record<StatusVariant, StatusMeta> = {
  healthy: {
    label: "Healthy",
    panelBorder: "border-[color-mix(in_srgb,var(--color-state-good)_35%,var(--color-border-default))]",
    panelBg: "bg-[color-mix(in_srgb,var(--color-state-good)_12%,var(--color-surface-card))]",
    badgeBorder: "border-[color-mix(in_srgb,var(--color-state-good)_55%,var(--color-border-default))]",
    badgeBg: "bg-[color-mix(in_srgb,var(--color-state-good)_55%,var(--color-surface-muted))]",
    text: "text-[var(--color-state-good)]",
    Icon: CheckCircle2,
  },
  watch: {
    label: "Watch",
    panelBorder: "border-[color-mix(in_srgb,var(--color-state-watch)_35%,var(--color-border-default))]",
    panelBg: "bg-[color-mix(in_srgb,var(--color-state-watch)_12%,var(--color-surface-card))]",
    badgeBorder: "border-[color-mix(in_srgb,var(--color-state-watch)_55%,var(--color-border-default))]",
    badgeBg: "bg-[color-mix(in_srgb,var(--color-state-watch)_55%,var(--color-surface-muted))]",
    text: "text-[var(--color-state-watch)]",
    Icon: TriangleAlert,
  },
  offline: {
    label: "Offline",
    panelBorder: "border-[color-mix(in_srgb,var(--color-state-offline)_35%,var(--color-border-default))]",
    panelBg: "bg-[color-mix(in_srgb,var(--color-state-offline)_12%,var(--color-surface-card))]",
    badgeBorder: "border-[color-mix(in_srgb,var(--color-state-offline)_55%,var(--color-border-default))]",
    badgeBg: "bg-[color-mix(in_srgb,var(--color-state-offline)_55%,var(--color-surface-muted))]",
    text: "text-[var(--color-state-offline)]",
    Icon: CircleDashed,
  },
  risk: {
    label: "Risk",
    panelBorder: "border-[color-mix(in_srgb,var(--color-state-risk)_40%,var(--color-border-default))]",
    panelBg: "bg-[color-mix(in_srgb,var(--color-state-risk)_10%,var(--color-surface-card))]",
    badgeBorder: "border-[color-mix(in_srgb,var(--color-state-risk)_55%,var(--color-border-default))]",
    badgeBg: "bg-[color-mix(in_srgb,var(--color-state-risk)_55%,var(--color-surface-muted))]",
    text: "text-[var(--color-state-risk)]",
    Icon: AlertTriangle,
  },
  loading: {
    label: "Loading",
    panelBorder: "border-[color-mix(in_srgb,var(--color-state-loading)_45%,var(--color-border-default))]",
    panelBg: "bg-[color-mix(in_srgb,var(--color-state-loading)_18%,var(--color-surface-card))]",
    badgeBorder: "border-[color-mix(in_srgb,var(--color-state-loading)_55%,var(--color-border-default))]",
    badgeBg: "bg-[color-mix(in_srgb,var(--color-state-loading)_55%,var(--color-surface-muted))]",
    text: "text-[var(--color-state-loading)]",
    Icon: Loader2,
  },
  empty: {
    label: "Empty",
    panelBorder: "border-[color-mix(in_srgb,var(--color-state-empty)_45%,var(--color-border-default))]",
    panelBg: "bg-[color-mix(in_srgb,var(--color-state-empty)_18%,var(--color-surface-card))]",
    badgeBorder: "border-[color-mix(in_srgb,var(--color-state-empty)_55%,var(--color-border-default))]",
    badgeBg: "bg-[color-mix(in_srgb,var(--color-state-empty)_55%,var(--color-surface-muted))]",
    text: "text-[var(--color-state-empty)]",
    Icon: Sparkles,
  },
  error: {
    label: "Error",
    panelBorder: "border-[color-mix(in_srgb,var(--color-state-risk)_55%,var(--color-border-default))]",
    panelBg: "bg-[color-mix(in_srgb,var(--color-state-risk)_20%,var(--color-surface-card))]",
    badgeBorder: "border-[color-mix(in_srgb,var(--color-state-risk)_70%,var(--color-border-default))]",
    badgeBg: "bg-[color-mix(in_srgb,var(--color-state-risk)_70%,var(--color-surface-muted))]",
    text: "text-[var(--color-state-risk)]",
    Icon: AlertCircle,
  },
};

export function statusPanelClass(status: StatusVariant) {
  return cn("rounded-2xl border p-4", STATUS_META[status].panelBorder, STATUS_META[status].panelBg);
}

export function statusTextClass(status: StatusVariant) {
  return STATUS_META[status].text;
}

export function statusLabel(status: StatusVariant) {
  return STATUS_META[status].label;
}

export function statusIcon(status: StatusVariant) {
  return STATUS_META[status].Icon;
}

export function StatusPanel({ status, children, className }: { status: StatusVariant; children: ReactNode; className?: string }) {
  return <div className={cn(statusPanelClass(status), className)}>{children}</div>;
}

export type StatusBadgeProps = {
  status: StatusVariant;
  label?: string;
  showIcon?: boolean;
  className?: string;
};

export function StatusBadge({ status, label, showIcon = true, className }: StatusBadgeProps) {
  const meta = STATUS_META[status];
  const Icon = meta.Icon;
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 rounded-full border px-3 py-0.5 text-[0.6rem] font-semibold uppercase tracking-[0.28em]",
        meta.badgeBorder,
        meta.badgeBg,
        meta.text,
        className,
      )}
    >
      {showIcon ? <Icon className="size-3" aria-hidden="true" /> : null}
      <span>{label ?? meta.label}</span>
    </span>
  );
}
