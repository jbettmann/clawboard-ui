"use client";

import Link from "next/link";
import { useRef } from "react";
import {
  ArrowDown,
  ArrowRight,
  ArrowUp,
  CheckCircle2,
  CircleDashed,
  FileText,
  Pin,
  Settings2,
  Sparkles,
  Sun,
  Timer,
  TriangleAlert,
  type LucideIcon,
} from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { PageHeader } from "@/components/page-header";
import { HomeWidgetId, useClawboardState } from "@/lib/clawboard-state";
import { EmptyState, ErrorState, LoadingState } from "@/components/ui/async-states";
import { fetchHomeOverview, HomeOverview } from "@/lib/openclaw-client";
import { useOpenClawResource } from "@/hooks/use-openclaw-resource";

type StatusTone = "good" | "watch" | "neutral";

type QuickActionItem = {
  label: string;
  description: string;
  href: string;
  icon: LucideIcon;
};

const quickActions: QuickActionItem[] = [
  {
    label: "Launch morning brief",
    description: "Refresh your focus with today's signals and reminder.",
    href: "/chat",
    icon: Sun,
  },
  {
    label: "Review active jobs",
    description: "See what is running and how soon the next result will arrive.",
    href: "/jobs",
    icon: Timer,
  },
  {
    label: "Browse outputs",
    description: "Open or pin references you rely on daily.",
    href: "/outputs",
    icon: FileText,
  },
  {
    label: "Tune connections",
    description: "Confirm gateways and credentials stay healthy.",
    href: "/connections",
    icon: CircleDashed,
  },
];

function signalToneIcon(tone: StatusTone) {
  if (tone === "good") return CheckCircle2;
  if (tone === "watch") return TriangleAlert;
  return CircleDashed;
}

function signalToneClasses(tone: StatusTone) {
  if (tone === "good") {
    return "border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-500/40 dark:bg-emerald-500/10 dark:text-emerald-200";
  }
  if (tone === "watch") {
    return "border-amber-200 bg-amber-50 text-amber-700 dark:border-amber-500/40 dark:bg-amber-500/10 dark:text-amber-200";
  }
  return "border-zinc-200 bg-zinc-50 text-zinc-900 dark:border-zinc-700/60 dark:bg-zinc-900/50 dark:text-zinc-100";
}

function renderWidget(id: HomeWidgetId, homeData: HomeOverview) {
  const signals = homeData.signals ?? [];
  const activeJobs = homeData.activeJobs ?? [];
  const pinnedOutputs = homeData.pinnedOutputs ?? [];

  if (id === "morning-brief") {
    return (
      <Card key={id}>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-xl">
            <Sparkles className="size-5 text-[var(--color-accent-primary)]" />
            Signals
          </CardTitle>
          <CardDescription className="text-base">
            Real-time markers from OpenClaw keep you grounded.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {signals.length ? (
            <div className="grid gap-3 sm:grid-cols-2">
              {signals.map((signal) => {
                const Icon = signalToneIcon(signal.tone);
                return (
                  <div
                    key={signal.label}
                    className={`rounded-2xl border p-4 ${signalToneClasses(signal.tone)}`}
                  >
                    <div className="flex items-center justify-between gap-2">
                      <p className="text-xs font-semibold uppercase tracking-[0.3em] text-zinc-700 dark:text-zinc-200">
                        {signal.label}
                      </p>
                      <Icon className="size-4" />
                    </div>
                    <p className="mt-3 text-2xl font-semibold">{signal.value}</p>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="rounded-2xl border border-dashed border-zinc-300/80 bg-zinc-50 p-4 text-sm text-zinc-600 dark:border-zinc-700/60 dark:bg-zinc-900 dark:text-zinc-300">
              <p className="text-base font-medium text-zinc-900 dark:text-zinc-100">No signals yet.</p>
              <p className="mt-1">
                Run a job or confirm your gateway connection to start seeing live markers here.
              </p>
              <div className="mt-3 flex flex-wrap gap-2">
                <Button variant="secondary" size="sm" asChild>
                  <Link href="/jobs">Create your first job</Link>
                </Button>
                <Button variant="ghost" size="sm" asChild>
                  <Link href="/connections">Check a connection</Link>
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    );
  }

  if (id === "quick-actions") {
    return (
      <Card key={id}>
        <CardHeader>
          <CardTitle className="text-xl">Next actions</CardTitle>
          <CardDescription className="text-base">
            Move forward with the workflows you rely on today.
          </CardDescription>
        </CardHeader>
        <CardContent className="grid gap-3">
          {quickActions.map((item) => (
            <Button
              key={item.label}
              asChild
              variant="secondary"
              className="h-12 justify-between px-4 text-base"
            >
              <Link href={item.href} className="flex w-full items-center justify-between gap-2">
                <span className="flex items-center gap-2">
                  <item.icon className="size-4" />
                  {item.label}
                </span>
                <ArrowRight className="size-4 text-zinc-500 dark:text-zinc-300" />
              </Link>
            </Button>
          ))}
        </CardContent>
      </Card>
    );
  }

  if (id === "active-jobs") {
    return (
      <Card key={id}>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-xl">
            <Timer className="size-5 text-zinc-500" />
            Active jobs
          </CardTitle>
          <CardDescription className="text-base">
            Track the automations that are currently running.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          {activeJobs.length ? (
            activeJobs.map((job) => (
              <div
                key={job.id}
                className="rounded-2xl border border-zinc-200/80 bg-zinc-50/80 p-4 dark:border-zinc-800/80 dark:bg-zinc-900"
              >
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="text-base font-medium text-zinc-900 dark:text-zinc-100">{job.title}</p>
                    <p className="text-sm text-zinc-600 dark:text-zinc-400">{job.detail}</p>
                  </div>
                  <Badge
                    variant="muted"
                    className={`text-[0.65rem] font-semibold uppercase tracking-wider ${
                      job.priority === "Soon"
                        ? "bg-amber-100 text-amber-800 dark:bg-amber-600/30 dark:text-amber-100"
                        : "bg-zinc-200 text-zinc-900 dark:bg-zinc-800/80 dark:text-zinc-100"
                    }`}
                  >
                    {job.priority}
                  </Badge>
                </div>
                <div className="mt-3 flex items-center gap-2 text-sm text-zinc-600 dark:text-zinc-400">
                  <Timer className="size-4" />
                  <span>ETA: {job.eta}</span>
                </div>
              </div>
            ))
          ) : (
            <div className="rounded-2xl border border-dashed border-zinc-300/80 bg-zinc-50 p-4 text-sm text-zinc-600 dark:border-zinc-700/60 dark:bg-zinc-900 dark:text-zinc-300">
              <p className="text-base font-medium text-zinc-900 dark:text-zinc-100">No active jobs yet.</p>
              <p className="mt-1">Schedule automation from the Jobs page to start tracking progress here.</p>
              <div className="mt-3 flex flex-wrap gap-2">
                <Button variant="secondary" size="sm" asChild>
                  <Link href="/jobs">Schedule a job</Link>
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    );
  }

  return (
    <Card key={id}>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-xl">
          <Pin className="size-5 text-zinc-500" />
          Pinned outputs
        </CardTitle>
        <CardDescription className="text-base">Keep your most useful results within reach.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-3">
        {pinnedOutputs.length ? (
          pinnedOutputs.map((item) => (
            <Link
              key={item.id}
              href="/outputs"
              className="flex items-center justify-between rounded-2xl border border-zinc-200/80 bg-zinc-50/80 px-4 py-3 transition-colors hover:bg-zinc-100 dark:border-zinc-800/80 dark:bg-zinc-900 dark:hover:bg-zinc-800"
            >
              <div>
                <p className="text-base font-medium text-zinc-900 dark:text-zinc-100">{item.title}</p>
                <p className="text-sm text-zinc-600 dark:text-zinc-400">{item.summary}</p>
                <p className="text-xs text-zinc-500 dark:text-zinc-400">Updated {item.updatedAt}</p>
              </div>
              <ArrowRight className="size-4 text-zinc-500 dark:text-zinc-300" />
            </Link>
          ))
        ) : (
          <div className="rounded-2xl border border-dashed border-zinc-300/80 bg-zinc-50 p-4 text-sm text-zinc-600 dark:border-zinc-700/60 dark:bg-zinc-900 dark:text-zinc-300">
            <p className="text-base font-medium text-zinc-900 dark:text-zinc-100">Nothing pinned yet.</p>
            <p className="mt-1">
              Pin outputs from the Outputs screen to surface the items you reference every day.
            </p>
            <div className="mt-3 flex flex-wrap gap-2">
              <Button variant="ghost" size="sm" asChild>
                <Link href="/outputs">Browse outputs</Link>
              </Button>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

export function HomeDashboard() {
  const { widgetPreferences, moveWidget, toggleWidgetVisibility } = useClawboardState();
  const customizationRef = useRef<HTMLDivElement | null>(null);
  const visibleWidgets = widgetPreferences.filter((item) => item.visible);

  function focusCustomization() {
    customizationRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
  }

  const { status, data, error, refresh } = useOpenClawResource<HomeOverview>(() => fetchHomeOverview(), []);

  const homeContent = (() => {
    if (status === "loading") {
      return <LoadingState title="Loading home data" description="Connecting to OpenClaw…" />;
    }

    if (status === "error") {
      return (
        <ErrorState
          title="Unable to load home data"
          description={error ?? "Tap retry once your gateway is reachable."}
          action={
            <Button size="sm" variant="ghost" onClick={refresh}>
              Retry
            </Button>
          }
        />
      );
    }

    if (!data) {
      return (
        <EmptyState
          title="No home data"
          description="OpenClaw has not reported anything yet. Refresh or inspect your gateway."
          action={
            <Button size="sm" variant="ghost" onClick={refresh}>
              Retry
            </Button>
          }
        />
      );
    }

    const signals = data.signals ?? [];
    const reminder = data.reminder ?? null;
    const activeJobs = data.activeJobs ?? [];
    const pinnedOutputs = data.pinnedOutputs ?? [];

    const summaryStats = [
      { label: "Signals", value: signals.length, detail: "Live markers from OpenClaw" },
      { label: "Active jobs", value: activeJobs.length, detail: "Automations in progress" },
      { label: "Pinned outputs", value: pinnedOutputs.length, detail: "Saved references" },
    ];

    const attentionSignal = signals.find((signal) => signal.tone !== "good");
    const attentionJob = attentionSignal ? null : activeJobs[0];
    const nextSteps = quickActions.slice(0, 3);
    const focusCue = (() => {
      if (attentionSignal) {
        return {
          icon: signalToneIcon(attentionSignal.tone),
          title: attentionSignal.label,
          detail: attentionSignal.value,
          helper:
            attentionSignal.tone === "watch"
              ? "Action recommended soon."
              : "Keep this signal on your radar.",
          statusLabel:
            attentionSignal.tone === "watch"
              ? "Action recommended"
              : "Signal at watch",
        };
      }

      if (attentionJob) {
        return {
          icon: Timer,
          title: attentionJob.title,
          detail: attentionJob.detail,
          helper: `ETA ${attentionJob.eta}.`,
          statusLabel: "Job in progress",
        };
      }

      return {
        icon: CheckCircle2,
        title: "Steady day",
        detail: "Live data is calm and nothing is flagged for attention.",
        helper: "We will spotlight anything urgent as soon as it appears.",
        statusLabel: "All clear",
      };
    })();
    const focusNeedsAttention = Boolean(attentionSignal || attentionJob);

    const FocusIcon = focusCue.icon;
    return (
      <div className="space-y-6">
        <div
          className={`rounded-2xl border px-5 py-4 ${
            focusNeedsAttention
              ? "border-[var(--color-accent-border)] bg-[var(--color-accent-muted)]"
              : "border-[var(--color-border-default)] bg-[var(--color-surface-muted)]"
          }`}
        >
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <span
                className={`flex h-10 w-10 items-center justify-center rounded-2xl border text-base ${
                  focusNeedsAttention
                    ? "border-[var(--color-accent-border)] bg-[var(--color-accent-muted)] text-[var(--color-accent-foreground)]"
                    : "border-[var(--color-border-default)] bg-[var(--color-surface-muted)] text-[var(--color-text-muted)]"
                }`}
              >
                <FocusIcon className="size-5" aria-hidden="true" />
              </span>
              <div>
                <p className="text-[0.6rem] font-semibold uppercase tracking-[0.4em] text-[var(--color-text-muted)]">
                  Focus
                </p>
                <p className="text-lg font-semibold text-[var(--color-text-strong)]">{focusCue.title}</p>
                <p className="text-sm text-[var(--color-text-muted)]">{focusCue.detail}</p>
              </div>
            </div>
            <Badge variant={focusNeedsAttention ? undefined : "muted"}>{focusCue.statusLabel}</Badge>
          </div>
          <p className="mt-3 text-sm text-[var(--color-text-muted)]">{focusCue.helper}</p>
        </div>
        <div className="grid gap-4 md:grid-cols-3">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">What you&rsquo;re looking at</CardTitle>
              <CardDescription className="text-base">Live OpenClaw context for today.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-3 sm:grid-cols-3">
                {summaryStats.map((stat) => (
                  <div
                    key={stat.label}
                    className="rounded-2xl border border-zinc-200/80 bg-zinc-50/60 p-3 dark:border-zinc-800/80 dark:bg-zinc-900/60"
                  >
                    <p className="text-[0.6rem] font-semibold uppercase tracking-[0.4em] text-zinc-500 dark:text-zinc-400">
                      {stat.label}
                    </p>
                    <p className="mt-2 text-2xl font-semibold text-zinc-900 dark:text-zinc-100">
                      {stat.value}
                    </p>
                    <p className="text-xs text-zinc-500 dark:text-zinc-400">{stat.detail}</p>
                  </div>
                ))}
              </div>
              <div className="rounded-2xl border border-zinc-200/80 bg-white p-4 dark:border-zinc-800/80 dark:bg-zinc-900">
                <p className="text-sm text-zinc-500 dark:text-zinc-400">{reminder?.label ?? "Next reminder"}</p>
                <p className="mt-1 text-lg font-semibold text-zinc-900 dark:text-zinc-100">
                  {reminder?.detail ?? "No reminder scheduled yet. Ask for one in chat or pin a quick note."}
                </p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-lg">What needs attention</CardTitle>
              <CardDescription className="text-base">Signals or jobs that should be on your radar.</CardDescription>
            </CardHeader>
            <CardContent>
              {attentionSignal ? (
                <div className="rounded-2xl border border-zinc-200/80 bg-zinc-50/80 p-4 dark:border-zinc-800/80 dark:bg-zinc-900">
                  <div className="flex items-center gap-3">
                    <div className="rounded-full border border-zinc-200/80 bg-white p-2 text-zinc-700 dark:border-zinc-700/60 dark:bg-zinc-900">
                      {(() => {
                        const Icon = signalToneIcon(attentionSignal.tone);
                        return <Icon className="size-5 text-zinc-500 dark:text-zinc-300" />;
                      })()}
                    </div>
                    <div>
                      <p className="text-xs font-semibold uppercase tracking-[0.3em] text-zinc-500 dark:text-zinc-400">
                        {attentionSignal.label}
                      </p>
                      <p className="text-2xl font-semibold text-zinc-900 dark:text-zinc-100">
                        {attentionSignal.value}
                      </p>
                    </div>
                  </div>
                  <p className="mt-3 text-sm text-zinc-600 dark:text-zinc-300">
                    {attentionSignal.tone === "watch"
                      ? "Action recommended soon."
                      : "Keep monitoring this metric."}
                  </p>
                </div>
              ) : attentionJob ? (
                <div className="rounded-2xl border border-zinc-200/80 bg-zinc-50/80 p-4 dark:border-zinc-800/80 dark:bg-zinc-900">
                  <p className="text-xs font-semibold uppercase tracking-[0.3em] text-zinc-500 dark:text-zinc-400">
                    Job in focus
                  </p>
                  <p className="mt-2 text-lg font-semibold text-zinc-900 dark:text-zinc-100">{attentionJob.title}</p>
                  <p className="text-sm text-zinc-600 dark:text-zinc-400">{attentionJob.detail}</p>
                  <div className="mt-3 flex items-center gap-2 text-sm text-zinc-600 dark:text-zinc-400">
                    <Timer className="size-4" />
                    <span>ETA: {attentionJob.eta}</span>
                  </div>
                </div>
              ) : (
                <p className="rounded-2xl border border-zinc-200/80 bg-zinc-50/80 p-4 text-sm text-zinc-600 dark:border-zinc-800/80 dark:bg-zinc-900 dark:text-zinc-300">
                  Everything looks calm right now. Once you run a job or a signal changes, this card will highlight it.
                </p>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-lg">What you can do next</CardTitle>
              <CardDescription className="text-base">Actions to keep the work moving forward.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <ul className="space-y-3 text-sm text-zinc-600 dark:text-zinc-400">
                {nextSteps.map((action) => (
                  <li key={action.label}>
                    <Link
                      href={action.href}
                      className="text-sm font-semibold text-zinc-900 hover:text-[var(--color-accent-primary)] dark:text-zinc-100"
                    >
                      {action.label}
                    </Link>
                    <p className="text-xs text-zinc-500 dark:text-zinc-400">{action.description}</p>
                  </li>
                ))}
              </ul>
              <div className="rounded-2xl border border-dashed border-zinc-300/80 bg-zinc-50/70 p-3 text-xs text-zinc-600 dark:border-zinc-700/60 dark:bg-zinc-900 dark:text-zinc-300">
                Personalize this view to surface the sections that help you most.
              </div>
            </CardContent>
          </Card>
        </div>

        {visibleWidgets.length ? (
          <div className="grid gap-5 xl:grid-cols-2">
            {visibleWidgets.map((widget) => renderWidget(widget.id, data))}
          </div>
        ) : (
          <EmptyState
            title="Sections are hidden"
            description="Show a section inside Personalize Home to see the live data that matters."
            action={
              <Button size="sm" variant="secondary" onClick={focusCustomization}>
                Personalize home
              </Button>
            }
          />
        )}
      </div>
    );
  })();

  return (
    <div className="space-y-5 pb-6">
      <PageHeader
        title="Home"
        context="Live OpenClaw context, attention signals, and the next steps you can take."
        supportingStatus={
          <>
            <Badge variant="muted">Live data</Badge>
            <Badge>OpenClaw</Badge>
          </>
        }
        primaryAction={
          <Button onClick={focusCustomization} size="lg" variant="secondary">
            Personalize home
          </Button>
        }
      />
      {homeContent}
      <div ref={customizationRef}>
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-xl">
              <Settings2 className="size-5 text-zinc-500" />
              Personalize home
            </CardTitle>
            <CardDescription className="text-base">
              Show or hide sections and reorder them so the information you need is front and center.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-2">
            {widgetPreferences.map((widget, index) => (
              <div
                key={widget.id}
                className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-zinc-200 bg-zinc-50 px-4 py-3 dark:border-zinc-800 dark:bg-zinc-900"
              >
                <div>
                  <p className="text-base font-medium text-zinc-900 dark:text-zinc-100">{widget.label}</p>
                  <p className="text-sm text-zinc-600 dark:text-zinc-400">
                    {widget.visible ? "Visible on Home" : "Hidden from Home"}
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  <Button
                    type="button"
                    onClick={() => moveWidget(widget.id, "up")}
                    variant="secondary"
                    className="h-10 px-3"
                    disabled={index === 0}
                    aria-label={`Move ${widget.label} up`}
                  >
                    <ArrowUp className="size-4" />
                  </Button>
                  <Button
                    type="button"
                    onClick={() => moveWidget(widget.id, "down")}
                    variant="secondary"
                    className="h-10 px-3"
                    disabled={index === widgetPreferences.length - 1}
                    aria-label={`Move ${widget.label} down`}
                  >
                    <ArrowDown className="size-4" />
                  </Button>
                  <Button
                    type="button"
                    onClick={() => toggleWidgetVisibility(widget.id)}
                    variant={widget.visible ? "default" : "secondary"}
                    className="h-10 min-w-24"
                    aria-pressed={widget.visible}
                    aria-label={`${widget.visible ? "Hide" : "Show"} ${widget.label}`}
                  >
                    {widget.visible ? "Shown" : "Hidden"}
                  </Button>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
