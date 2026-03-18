import type { ReactNode } from "react";

import { cn } from "@/lib/utils";

export function InfoTile({
  label,
  value,
  helper,
  icon,
  className,
}: {
  label: string;
  value: ReactNode;
  helper?: ReactNode;
  icon?: ReactNode;
  className?: string;
}) {
  return (
    <div className={cn("rounded-xl border border-[var(--color-border-default)] bg-[var(--color-surface-muted)] p-3", className)}>
      <div className="flex items-center justify-between gap-2">
        <p className="text-xs text-[var(--color-text-soft)]">{label}</p>
        {icon ? <span className="text-[var(--color-text-soft)]">{icon}</span> : null}
      </div>
      <div className="mt-1 text-base font-medium text-[var(--color-text-strong)]">{value}</div>
      {helper ? <p className="mt-1 text-xs text-[var(--color-text-soft)]">{helper}</p> : null}
    </div>
  );
}
