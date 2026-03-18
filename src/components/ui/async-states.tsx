import type { ReactNode } from "react";
import { Sparkles } from "lucide-react";

type BaseStateProps = {
  title?: string;
  description?: string;
};

export function LoadingState({ title, description }: BaseStateProps) {
  return (
    <div
      className="flex flex-col items-center justify-center gap-2 rounded-2xl border border-dashed border-[var(--color-border-default)] bg-[var(--color-surface-muted)] px-6 py-8 text-center"
      role="status"
      aria-live="polite"
    >
      <div className="h-10 w-10 animate-pulse rounded-full bg-[var(--color-accent-muted)]" />
      <p className="text-lg font-semibold text-[var(--color-text-strong)]">{title ?? "Loading…"}</p>
      {description ? <p className="text-sm text-[var(--color-text-muted)]">{description}</p> : null}
    </div>
  );
}

type ErrorStateProps = BaseStateProps & {
  action?: ReactNode;
};

export function ErrorState({ title, description, action }: ErrorStateProps) {
  return (
    <div className="flex flex-col items-center justify-center gap-3 rounded-2xl border border-rose-200 bg-rose-50 px-6 py-8 text-center text-rose-700">
      <Sparkles className="size-6 text-rose-500" />
      <p className="text-lg font-semibold text-rose-900">{title ?? "We hit a snag"}</p>
      {description ? <p className="text-sm text-rose-800">{description}</p> : null}
      {action}
    </div>
  );
}

type EmptyStateProps = BaseStateProps & {
  action?: ReactNode;
};

export function EmptyState({ title, description, action }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center gap-3 rounded-2xl border border-dashed border-[var(--color-border-default)] bg-[var(--color-surface-muted)] px-6 py-8 text-center">
      <Sparkles className="size-6 text-[var(--color-accent-primary)]" />
      <p className="text-lg font-semibold text-[var(--color-text-strong)]">{title ?? "Nothing to show yet"}</p>
      {description ? <p className="text-sm text-[var(--color-text-muted)]">{description}</p> : null}
      {action ? (
        <div className="mt-2">{action}</div>
      ) : null}
    </div>
  );
}
