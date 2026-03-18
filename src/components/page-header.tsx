import type { ReactNode } from "react";

type PageHeaderProps = {
  title: string;
  context: string;
  primaryAction: ReactNode;
  supportingStatus: ReactNode;
};

export function PageHeader({ title, context, primaryAction, supportingStatus }: PageHeaderProps) {
  return (
    <header className="rounded-2xl border border-[var(--color-border-default)] bg-[var(--color-surface-card)] p-6 shadow-[var(--shadow-card)]">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div className="space-y-2">
          <p className="text-sm uppercase tracking-[0.3em] text-[var(--color-text-muted)]">Dashboard</p>
          <h1 className="text-3xl font-semibold leading-tight text-[var(--color-text-strong)]">{title}</h1>
          <p className="text-sm text-[var(--color-text-muted)]">{context}</p>
        </div>
        <div className="flex flex-col items-start gap-3 text-right sm:items-end sm:text-right md:flex-row md:items-center md:gap-4">
          <div className="flex flex-wrap items-center gap-2 text-sm text-[var(--color-text-muted)]">
            {supportingStatus}
          </div>
          <div>{primaryAction}</div>
        </div>
      </div>
    </header>
  );
}
