import type { ReactNode } from "react";
import { Sparkles } from "lucide-react";

type BaseStateProps = {
  title?: string;
  description?: string;
};

function StateIcon({ muted = false }: { muted?: boolean }) {
  return (
    <div className="flex h-11 w-11 items-center justify-center rounded-2xl border border-[var(--color-accent-border)] bg-[var(--color-accent-muted)]">
      <Sparkles className={`size-5 ${muted ? "text-[var(--color-text-muted)]" : "text-[var(--color-accent-primary)]"}`} />
    </div>
  );
}

export function LoadingState({ title, description }: BaseStateProps) {
  return (
    <div
      className="surface-panel flex flex-col items-center justify-center gap-3 px-6 py-9 text-center"
      role="status"
      aria-live="polite"
    >
      <div className="relative">
        <div className="absolute inset-0 animate-ping rounded-2xl bg-[var(--color-accent-muted)] opacity-60" />
        <StateIcon />
      </div>
      <div className="space-y-1">
        <p className="text-lg font-semibold text-[var(--color-text-strong)]">{title ?? "Loading…"}</p>
        {description ? <p className="mx-auto max-w-xl text-sm leading-6 text-[var(--color-text-muted)]">{description}</p> : null}
      </div>
    </div>
  );
}

type ErrorStateProps = BaseStateProps & {
  action?: ReactNode;
};

export function ErrorState({ title, description, action }: ErrorStateProps) {
  return (
    <div className="flex flex-col items-center justify-center gap-4 rounded-[var(--radius-card)] border border-[var(--color-accent-border)] bg-[linear-gradient(180deg,color-mix(in_srgb,var(--color-accent-muted)_85%,transparent),transparent)] px-6 py-9 text-center text-[var(--color-accent-foreground)]">
      <StateIcon />
      <div className="space-y-1">
        <p className="text-lg font-semibold text-[var(--color-text-strong)]">{title ?? "We hit a snag"}</p>
        {description ? <p className="mx-auto max-w-xl text-sm leading-6 text-[var(--color-text-muted)]">{description}</p> : null}
      </div>
      {action ? <div className="pt-1">{action}</div> : null}
    </div>
  );
}

type EmptyStateProps = BaseStateProps & {
  action?: ReactNode;
};

export function EmptyState({ title, description, action }: EmptyStateProps) {
  return (
    <div className="surface-panel flex flex-col items-center justify-center gap-4 px-6 py-9 text-center">
      <StateIcon muted />
      <div className="space-y-1">
        <p className="text-lg font-semibold text-[var(--color-text-strong)]">{title ?? "Nothing to show yet"}</p>
        {description ? <p className="mx-auto max-w-xl text-sm leading-6 text-[var(--color-text-muted)]">{description}</p> : null}
      </div>
      {action ? <div className="pt-1">{action}</div> : null}
    </div>
  );
}
