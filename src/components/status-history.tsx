"use client";

import Link from "next/link";
import { Archive, CheckCircle2, CircleAlert, Clock3, History, Timer } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { EmptyState, ErrorState, LoadingState } from "@/components/ui/async-states";
import { PageHeader } from "@/components/page-header";
import {
  fetchStatusSnapshot,
  fetchStatusTimeline,
  type StatusSnapshotItem,
  type StatusTimelineEvent,
  type StatusTone,
} from "@/lib/openclaw-client";
import { useOpenClawResource } from "@/hooks/use-openclaw-resource";

function toneTextClass(tone: StatusTone) {
  if (tone === "good") return "text-emerald-700 dark:text-emerald-300";
  if (tone === "watch") return "text-amber-700 dark:text-amber-300";
  return "text-zinc-800 dark:text-zinc-100";
}

function toneIcon(tone: StatusTone) {
  if (tone === "good") {
    return <CheckCircle2 className="size-4 text-emerald-500" />;
  }
  if (tone === "watch") {
    return <CircleAlert className="size-4 text-amber-500" />;
  }
  return <Timer className="size-4 text-zinc-500" />;
}

type FocusSignal = {
  id: string;
  label: string;
  summary: string;
  detail: string;
};

function toneLabel(tone: StatusTone) {
  if (tone === "good") return "Stable";
  if (tone === "watch") return "Watch";
  return "Info";
}

function toneAction(tone: StatusTone) {
  if (tone === "good") return "Stable – keep an eye on it.";
  if (tone === "watch") return "Check the related connection or auth state.";
  return "Informational note – monitor for changes.";
}

export function StatusHistory() {
  const {
    status: snapshotStatus,
    data: snapshotData,
    error: snapshotError,
    refresh: refreshSnapshot,
  } = useOpenClawResource<StatusSnapshotItem[]>(fetchStatusSnapshot, []);
  const {
    status: timelineStatus,
    data: timelineData,
    error: timelineError,
    refresh: refreshTimeline,
  } = useOpenClawResource<StatusTimelineEvent[]>(fetchStatusTimeline, []);

  const snapshot = snapshotData ?? [];
  const timeline = timelineData ?? [];

  const focusSignals: FocusSignal[] = (() => {
    const snapshotSignals = snapshot
      .filter((item) => item.tone !== "good")
      .map((item) => ({
        id: item.label,
        label: item.label,
        summary: toneLabel(item.tone),
        detail: item.value,
      }));

    const timelineSignals = timeline
      .filter((event) => event.tone !== "good")
      .map((event) => ({
        id: `${event.time}-${event.title}`,
        label: event.title,
        summary: `${toneLabel(event.tone)} • ${event.time}`,
        detail: event.detail,
      }));

    return [...snapshotSignals, ...timelineSignals].slice(0, 3);
  })();

  const snapshotBadges = snapshot.slice(0, 3).map((item) => (
    <Badge key={item.label} variant="muted">
      {item.label}: {item.value}
    </Badge>
  ));

  const baseBadges =
    snapshotBadges.length > 0
      ? snapshotBadges
      : [
          <Badge key="placeholder" variant="muted">
            {snapshotStatus === "loading" ? "Refreshing" : "Awaiting data"}
          </Badge>,
        ];

  const supportingBadges = [
    ...(focusSignals.length
      ? [
          <Badge key="focus" variant="muted">
            {focusSignals.length} attention item{focusSignals.length > 1 ? "s" : ""}
          </Badge>,
        ]
      : []),
    ...baseBadges,
  ];

  const refreshAll = () => {
    refreshSnapshot();
    refreshTimeline();
  };

  const snapshotContent = (() => {
    if (snapshotStatus === "loading") {
      return <LoadingState title="Loading status snapshot" description="Collecting system health data…" />;
    }
    if (snapshotStatus === "error") {
      return (
        <ErrorState
          title="Unable to load snapshot"
          description={snapshotError ?? "Check connectivity and refresh to reconnect to OpenClaw."}
          action={
            <Button variant="ghost" onClick={refreshSnapshot}>
              Retry
            </Button>
          }
        />
      );
    }
    if (!snapshot.length) {
      return (
        <EmptyState
          title="Snapshot warming up"
          description="OpenClaw is still sharing health data; it will appear here shortly."
          action={
            <Button variant="ghost" onClick={refreshSnapshot}>
              Refresh
            </Button>
          }
        />
      );
    }

    return (
      <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-4">
        {snapshot.map((item) => (
          <Card key={item.label}>
            <CardHeader>
              <CardDescription>{item.label}</CardDescription>
              <CardTitle className={`text-2xl ${toneTextClass(item.tone)}`}>{item.value}</CardTitle>
            </CardHeader>
          </Card>
        ))}
      </div>
    );
  })();

  const timelineContent = (() => {
    if (timelineStatus === "loading") {
      return <LoadingState title="Loading timeline" description="Building the recent activity log…" />;
    }
    if (timelineStatus === "error") {
      return (
        <ErrorState
          title="Unable to load events"
          description={timelineError ?? "Check your connection and refresh to load recent activity."}
          action={
            <Button variant="ghost" onClick={refreshTimeline}>
              Retry
            </Button>
          }
        />
      );
    }
    if (!timeline.length) {
      return (
        <EmptyState
          title="Activity coming soon"
          description="Events will appear here once OpenClaw reports them."
          action={
            <Button variant="ghost" onClick={refreshTimeline}>
              Refresh
            </Button>
          }
        />
      );
    }

    return (
      <div className="space-y-3">
        {timeline.map((event) => (
          <div
            key={`${event.time}-${event.title}`}
            className="rounded-xl border border-zinc-200 bg-zinc-50 p-4 dark:border-zinc-800 dark:bg-zinc-900"
          >
            <p className="flex items-center gap-2 text-sm text-zinc-500 dark:text-zinc-400">
              <Clock3 className="size-4" />
              {event.time}
            </p>
            <p className="mt-1 flex items-center gap-2 text-base font-medium text-zinc-900 dark:text-zinc-100">
              {toneIcon(event.tone)}
              {event.title}
            </p>
            <p className="text-xs uppercase tracking-[0.3em] text-zinc-500 dark:text-zinc-400">{toneLabel(event.tone)}</p>
            <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">{event.detail}</p>
            <p className="text-xs text-zinc-500 dark:text-zinc-400">{toneAction(event.tone)}</p>
          </div>
        ))}
      </div>
    );
  })();

  const digestLines = timeline.slice(0, 3).map((event) => `${event.time} — ${event.title}`);

  return (
    <div className="space-y-5 pb-6">
      <PageHeader
        title="Status & history"
        context="Live health snapshots, calm activity timeline, and digestible context from OpenClaw."
        supportingStatus={<>{supportingBadges}</>}
        primaryAction={
          <Button onClick={refreshAll} size="lg" variant="secondary">
            Refresh
          </Button>
        }
      />

      <div>{snapshotContent}</div>

      <Card>
        <CardHeader>
          <CardTitle>Action focus</CardTitle>
          <CardDescription>Signals worth a calm glance right now.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          {focusSignals.length ? (
            focusSignals.map((signal) => (
              <div
                key={signal.id}
                className="rounded-xl border border-zinc-200 bg-zinc-50 p-3 dark:border-zinc-800 dark:bg-zinc-900"
              >
                <p className="text-sm font-semibold text-[var(--color-text-strong)]">{signal.label}</p>
                <p className="text-xs uppercase tracking-[0.3em] text-zinc-500 dark:text-zinc-400">{signal.summary}</p>
                <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">{signal.detail}</p>
              </div>
            ))
          ) : (
            <p className="rounded-xl border border-dashed border-zinc-300 bg-zinc-50 px-4 py-3 text-sm text-zinc-600 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-400">
              All systems look steady. Keep watching the timeline for new activity.
            </p>
          )}
          <div className="flex flex-wrap gap-2 pt-2">
            <Button asChild size="sm" variant="ghost">
              <Link href="/connections">Connections center</Link>
            </Button>
            <Button asChild size="sm" variant="ghost">
              <Link href="/settings/advanced">Status & history</Link>
            </Button>
          </div>
        </CardContent>
      </Card>

      <div className="grid gap-5 xl:grid-cols-[1.2fr_1fr]">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <History className="size-4 text-zinc-500" />
              Activity timeline
            </CardTitle>
            <CardDescription>Recent events told simply so you can plan the next steps.</CardDescription>
          </CardHeader>
          <CardContent>{timelineContent}</CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Archive className="size-4 text-zinc-500" />
              Log digest
            </CardTitle>
            <CardDescription>Concise reminders that keep the signal clear.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {digestLines.length ? (
              digestLines.map((line) => (
                <p
                  key={line}
                  className="rounded-xl border border-zinc-200 bg-zinc-50 px-4 py-3 text-sm text-zinc-700 dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-300"
                >
                  {line}
                </p>
              ))
            ) : (
              <p className="rounded-xl border border-zinc-200 bg-zinc-50 px-4 py-3 text-sm text-zinc-700 dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-300">
                No digest entries are available yet.
              </p>
            )}
            <p className="rounded-xl border border-dashed border-zinc-300 bg-zinc-50 px-4 py-3 text-sm text-zinc-700 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-300">
              This digest keeps meaningful trends visible without amplifying noise.
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
