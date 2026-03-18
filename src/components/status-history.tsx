"use client";

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
  if (tone === "good") {
    return "text-emerald-700 dark:text-emerald-300";
  }
  if (tone === "watch") {
    return "text-amber-700 dark:text-amber-300";
  }
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

  const supportingBadges = snapshot.slice(0, 3).map((item) => (
    <Badge key={item.label} variant="muted">
      {item.value}
    </Badge>
  ));
  if (!supportingBadges.length) {
    supportingBadges.push(
      <Badge key="placeholder" variant="muted">
        {snapshotStatus === "loading" ? "Refreshing" : "Awaiting data"}
      </Badge>,
    );
  }

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
          description={snapshotError ?? "Try refreshing to reconnect to OpenClaw."}
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
          title="No status snapshot"
          description="OpenClaw has not reported any high-level signals yet."
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
          description={timelineError ?? "Try refreshing to get the latest activity."}
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
          title="No activity yet"
          description="OpenClaw has not reported timeline events."
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
            <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">{event.detail}</p>
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
        context="Live health snapshots, activity timeline, and digestible context from OpenClaw."
        supportingStatus={<>{supportingBadges}</>}
        primaryAction={
          <Button onClick={refreshAll} size="lg" variant="secondary">
            Refresh
          </Button>
        }
      />

      <div>{snapshotContent}</div>

      <div className="grid gap-5 xl:grid-cols-[1.2fr_1fr]">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <History className="size-4 text-zinc-500" />
              Activity timeline
            </CardTitle>
            <CardDescription>Recent events translated into calm language.</CardDescription>
          </CardHeader>
          <CardContent>{timelineContent}</CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Archive className="size-4 text-zinc-500" />
              Log digest
            </CardTitle>
            <CardDescription>Short summaries you can scan quickly.</CardDescription>
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
              This view keeps useful trends visible without exposing debug noise.
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
