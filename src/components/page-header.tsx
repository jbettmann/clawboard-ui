import type { ReactNode } from "react";

type PageHeaderProps = {
  title: string;
  context: string;
  primaryAction: ReactNode;
  supportingStatus: ReactNode;
  pageActions?: ReactNode;
};

export function PageHeader({
  title,
  context,
  primaryAction,
  supportingStatus,
  pageActions,
}: PageHeaderProps) {
  return (
    <header className="surface-card relative overflow-hidden p-5 sm:p-6 lg:p-7">
      <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-[var(--color-accent-border)] to-transparent" />
      <div className="relative flex flex-col gap-5">
        <div className="relative flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
          <div className="max-w-3xl space-y-3">
            <p className="type-role-kicker">Dashboard</p>
            <div className="space-y-2">
              <h1 className="type-role-page-title">{title}</h1>
              <p className="type-role-body max-w-2xl">{context}</p>
            </div>
          </div>

          <div className="flex flex-col items-start gap-3 sm:flex-row sm:flex-wrap sm:items-center sm:justify-end sm:gap-4 lg:max-w-[46%] lg:flex-col lg:items-end xl:max-w-[42%]">
            <div className="flex flex-wrap items-center gap-2 text-sm text-[var(--color-text-muted)]">
              {supportingStatus}
            </div>
            <div className="flex w-full flex-wrap items-center gap-2 sm:w-auto sm:justify-end">
              {primaryAction}
            </div>
          </div>
        </div>
        {pageActions ? (
          <div className="flex flex-wrap items-center gap-3 border-t border-dashed border-[var(--color-border-default)] pt-4 text-sm text-[var(--color-text-muted)]">
            {pageActions}
          </div>
        ) : null}
      </div>
    </header>
  );
}
