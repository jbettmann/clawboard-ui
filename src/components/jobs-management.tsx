"use client";

import type { ReactNode } from "react";
import { useEffect, useMemo, useState } from "react";
import { Activity, CalendarClock, Clock3, History, Pause, type LucideIcon } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { PageHeader } from "@/components/page-header";
import { EmptyState, ErrorState, LoadingState } from "@/components/ui/async-states";
import { fetchJobHistory, fetchJobs, type Job, type JobHistoryEntry, JobStatus } from "@/lib/openclaw-client";
import { useOpenClawResource } from "@/hooks/use-openclaw-resource";

const CORE_STATUS_ORDER = ["running", "scheduled", "paused"] as const;
type CoreJobStatus = (typeof CORE_STATUS_ORDER)[number];
type JobBucketKey = CoreJobStatus | "other";

type StatusSnapshot = {
  buckets: Record<JobBucketKey, Job[]>;
  counts: Record<JobBucketKey, number> & { total: number };
};

type StatusTileMeta = {
  heading: string;
  description: string;
  accent: string;
  Icon: LucideIcon;
};

const statusTileMeta: Record<JobBucketKey, StatusTileMeta> = {
  running: {
    heading: "Active now",
    description: "Jobs currently executing in the scheduler.",
    accent: "border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-500/40 dark:bg-emerald-500/10 dark:text-emerald-100",
    Icon: Activity,
  },
  scheduled: {
    heading: "Scheduled",
    description: "Runs queued and waiting for their trigger.",
    accent: "border-indigo-200 bg-indigo-50 text-indigo-700 dark:border-indigo-500/40 dark:bg-indigo-500/10 dark:text-indigo-100",
    Icon: CalendarClock,
  },
  paused: {
    heading: "Paused",
    description: "Manual pauses or throttled automations.",
    accent: "border-zinc-200 bg-zinc-50 text-zinc-700 dark:border-zinc-700/60 dark:bg-zinc-900/60 dark:text-zinc-100",
    Icon: Pause,
  },
  other: {
    heading: "Other states",
    description: "Transitional or legacy statuses.",
    accent: "border-zinc-200 bg-zinc-50 text-zinc-700 dark:border-zinc-800/60 dark:bg-zinc-900/50 dark:text-zinc-100",
    Icon: History,
  },
};

const HISTORY_STATUS_ORDER: JobHistoryEntry["status"][] = ["success", "failure", "canceled", "timeout"];

function statusPill(status: JobStatus) {
  const normalized = status?.toLowerCase?.() ?? "";
  if (normalized === "running") {
    return <Badge className="bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-300">Running</Badge>;
  }
  if (normalized === "paused") {
    return <Badge className="bg-zinc-200 text-zinc-700 dark:bg-zinc-800 dark:text-zinc-200">Paused</Badge>;
  }
  if (normalized === "scheduled") {
    return <Badge variant="muted">Scheduled</Badge>;
  }
  const label = status ? `${status.charAt(0).toUpperCase()}${status.slice(1)}` : "Unknown";
  return <Badge variant="muted">{label}</Badge>;
}

function historyBadge(status: JobHistoryEntry["status"]) {
  if (status === "success") {
    return <Badge className="bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-300">Success</Badge>;
  }
  if (status === "failure") {
    return <Badge className="bg-rose-100 text-rose-800 dark:bg-rose-900/30 dark:text-rose-200">Failed</Badge>;
  }
  if (status === "canceled") {
    return <Badge variant="muted">Canceled</Badge>;
  }
  return <Badge variant="muted">Timeout</Badge>;
}

function formatDateTime(value?: string) {
  if (!value) return "—";
  const parsed = Date.parse(value);
  if (Number.isNaN(parsed)) {
    return value;
  }
  return new Intl.DateTimeFormat(undefined, {
    dateStyle: "short",
    timeStyle: "short",
  }).format(parsed);
}

function formatDuration(durationMs?: number) {
  if (!durationMs) return "—";
  if (durationMs < 1000) {
    return `${durationMs} ms`;
  }
  const seconds = Math.round(durationMs / 1000);
  if (seconds < 60) return `${seconds}s`;
  const minutes = Math.floor(seconds / 60);
  const remainder = seconds % 60;
  return `${minutes}m ${remainder}s`;
}

type OverviewItemProps = {
  label: string;
  value: string;
  helper?: string;
  icon?: ReactNode;
};

function OverviewItem({ label, value, helper, icon }: OverviewItemProps) {
  return (
    <div className="rounded-2xl border border-zinc-200/80 bg-white p-4 text-sm text-zinc-700 dark:border-zinc-800/80 dark:bg-zinc-950 dark:text-zinc-300">
      <div className="flex items-center justify-between gap-3">
        <p className="text-xs text-zinc-500 dark:text-zinc-400">{label}</p>
        {icon ? <span className="text-zinc-500 dark:text-zinc-400">{icon}</span> : null}
      </div>
      <p className="mt-1 text-lg font-semibold text-zinc-900 dark:text-zinc-100">{value}</p>
      {helper ? <p className="mt-1 text-xs text-zinc-500 dark:text-zinc-400">{helper}</p> : null}
    </div>
  );
}

export function JobsManagement() {
  const { status, data, error, refresh } = useOpenClawResource<Job[]>(fetchJobs, []);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const jobs = useMemo(() => data ?? [], [data]);

  const statusSnapshot = useMemo<StatusSnapshot>(() => {
    const buckets: Record<JobBucketKey, Job[]> = {
      running: [],
      scheduled: [],
      paused: [],
      other: [],
    };
    jobs.forEach((job) => {
      const normalized = CORE_STATUS_ORDER.includes(job.status as CoreJobStatus)
        ? (job.status as CoreJobStatus)
        : "other";
      buckets[normalized].push(job);
    });
    return {
      buckets,
      counts: {
        running: buckets.running.length,
        scheduled: buckets.scheduled.length,
        paused: buckets.paused.length,
        other: buckets.other.length,
        total: jobs.length,
      },
    };
  }, [jobs]);

  const prioritizedJobs = useMemo(() => {
    return [...jobs].sort((a, b) => {
      const aIndex = CORE_STATUS_ORDER.indexOf(a.status as CoreJobStatus);
      const bIndex = CORE_STATUS_ORDER.indexOf(b.status as CoreJobStatus);
      const aRank = aIndex === -1 ? CORE_STATUS_ORDER.length : aIndex;
      const bRank = bIndex === -1 ? CORE_STATUS_ORDER.length : bIndex;
      if (aRank !== bRank) {
        return aRank - bRank;
      }
      return a.name.localeCompare(b.name);
    });
  }, [jobs]);

  useEffect(() => {
    if (status !== "success" || !prioritizedJobs.length) {
      return;
    }
    const timer = setTimeout(() => {
      setSelectedId((prev) => (prev && prioritizedJobs.some((job) => job.id === prev) ? prev : prioritizedJobs[0].id));
    }, 0);
    return () => {
      clearTimeout(timer);
    };
  }, [status, prioritizedJobs]);

  const selectedJob = useMemo(() => {
    if (!jobs.length) return null;
    if (selectedId) {
      const found = jobs.find((job) => job.id === selectedId);
      if (found) return found;
    }
    return prioritizedJobs[0] ?? null;
  }, [jobs, prioritizedJobs, selectedId]);

  const {
    status: historyStatus,
    data: historyData,
    error: historyError,
    refresh: refreshJobHistory,
  } = useOpenClawResource<JobHistoryEntry[]>(
    () => (selectedJob ? fetchJobHistory(selectedJob.id) : Promise.resolve([])),
    [selectedJob?.id],
  );

  const jobHistory = useMemo(() => historyData ?? [], [historyData]);
  const sortedHistory = useMemo(() => {
    return jobHistory
      .slice()
      .sort((a, b) => Date.parse(b.startedAt) - Date.parse(a.startedAt));
  }, [jobHistory]);

  const latestHistory = sortedHistory[0] ?? null;

  const historyStatusSummary = useMemo(() => {
    const summary: Record<JobHistoryEntry["status"], number> = {
      success: 0,
      failure: 0,
      canceled: 0,
      timeout: 0,
    };
    jobHistory.forEach((entry) => {
      summary[entry.status] = (summary[entry.status] ?? 0) + 1;
    });
    return summary;
  }, [jobHistory]);

  const nextRunLabel = selectedJob
    ? selectedJob.nextRun ?? (selectedJob.nextRunAt ? formatDateTime(selectedJob.nextRunAt) : "—")
    : "—";

  const scheduleLabel = selectedJob
    ? selectedJob.schedule ?? selectedJob.scheduleText ?? "—"
    : "—";

  const OtherTileIcon = statusTileMeta.other.Icon;

  const header = (
      <PageHeader
        title="Jobs management"
        context="Live scheduler data from OpenClaw. Adjustments live upstream in OpenClaw or via supported APIs."
      supportingStatus={
        <>
          <Badge variant="muted">{statusSnapshot.counts.total} job{statusSnapshot.counts.total === 1 ? "" : "s"}</Badge>
          <Badge variant="muted">Active {statusSnapshot.counts.running}</Badge>
          <Badge variant="muted">Scheduled {statusSnapshot.counts.scheduled}</Badge>
          <Badge variant="muted">Paused {statusSnapshot.counts.paused}</Badge>
          <Badge variant="muted">{status === "success" ? "Live" : status === "loading" ? "Refreshing" : status === "error" ? "Unavailable" : "Idle"}</Badge>
        </>
      }
      primaryAction={
        <Button size="lg" variant="secondary" onClick={refresh}>
          Refresh
        </Button>
      }
    />
  );

  if (status === "loading") {
    return (
      <div className="page-shell">
        {header}
        <LoadingState title="Loading jobs" description="Fetching live scheduler data from OpenClaw…" />
      </div>
    );
  }

  if (status === "error") {
    return (
      <div className="page-shell">
        {header}
        <ErrorState
          title="Unable to load jobs"
          description={error ?? "Confirm your gateway is reachable and try again."}
          action={
            <Button variant="ghost" onClick={refresh}>
              Retry
            </Button>
          }
        />
      </div>
    );
  }

  if (!jobs.length) {
    return (
      <div className="page-shell">
        {header}
        <EmptyState
          title="No jobs to show"
          description="The scheduler returned an empty set. Create schedules in OpenClaw to populate this view."
          action={
            <Button variant="ghost" onClick={refresh}>
              Refresh
            </Button>
          }
        />
      </div>
    );
  }

  return (
    <div className="page-shell">
      {header}

      <section className="grid gap-4 md:grid-cols-3">
        {CORE_STATUS_ORDER.map((statusKey) => {
          const TileIcon = statusTileMeta[statusKey].Icon;
          return (
            <div
              key={statusKey}
              className={`rounded-2xl border px-5 py-4 shadow-[var(--shadow-card)] ${statusTileMeta[statusKey].accent}`}
            >
              <div className="flex items-center justify-between gap-2 text-xs font-semibold uppercase tracking-[0.3em]">
                <span>{statusTileMeta[statusKey].heading}</span>
                <TileIcon className="size-5" />
              </div>
              <p className="mt-4 text-3xl font-semibold text-[var(--color-text-strong)]">{statusSnapshot.counts[statusKey]}</p>
              <p className="mt-1 text-sm text-[var(--color-text-muted)]">{statusTileMeta[statusKey].description}</p>
            </div>
          );
        })}
        {statusSnapshot.counts.other ? (
          <div className={`rounded-2xl border px-5 py-4 shadow-[var(--shadow-card)] ${statusTileMeta.other.accent}`}>
            <div className="flex items-center justify-between gap-2 text-xs font-semibold uppercase tracking-[0.3em]">
              <span>{statusTileMeta.other.heading}</span>
              <OtherTileIcon className="size-5" />
            </div>
            <p className="mt-4 text-3xl font-semibold text-[var(--color-text-strong)]">{statusSnapshot.counts.other}</p>
            <p className="mt-1 text-sm text-[var(--color-text-muted)]">{statusTileMeta.other.description}</p>
          </div>
        ) : null}
      </section>

      <div className="grid gap-5 lg:grid-cols-[360px_1fr]">
        <Card>
          <CardHeader>
            <CardTitle>Job list</CardTitle>
            <CardDescription>Grouped by scheduler state so you can spot active work first.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-5">
            {CORE_STATUS_ORDER.map((statusKey) => (
              <div key={statusKey} className="space-y-3">
                <div className="flex items-center justify-between text-xs uppercase tracking-[0.3em] text-zinc-500">
                  <span>{statusTileMeta[statusKey].heading}</span>
                  <Badge variant="muted">{statusSnapshot.buckets[statusKey].length} job{statusSnapshot.buckets[statusKey].length === 1 ? "" : "s"}</Badge>
                </div>
                <div className="space-y-2">
                  {statusSnapshot.buckets[statusKey].length ? (
                    statusSnapshot.buckets[statusKey].map((job) => (
                      <button
                        key={job.id}
                        type="button"
                        onClick={() => setSelectedId(job.id)}
                        aria-pressed={selectedId === job.id}
                        aria-label={`View job ${job.name}`}
                        className={`w-full rounded-xl border p-3 text-left transition-colors ${
                          selectedId === job.id
                            ? "border-zinc-900 bg-zinc-900 text-zinc-50 dark:border-zinc-100 dark:bg-zinc-100 dark:text-zinc-900"
                            : "border-zinc-200 bg-zinc-50 hover:bg-zinc-100 dark:border-zinc-800 dark:bg-zinc-900 dark:hover:bg-zinc-800"
                        }`}
                      >
                        <div className="flex items-center justify-between gap-2">
                          <p className="text-sm font-semibold">{job.name}</p>
                          {statusPill(job.status)}
                        </div>
                        <p className="mt-1 text-sm text-zinc-500">{job.purpose ?? "No purpose provided"}</p>
                        <p className="mt-2 text-xs font-semibold uppercase tracking-[0.2em] text-zinc-500">
                          Next: {job.nextRun ?? (job.nextRunAt ? formatDateTime(job.nextRunAt) : "—")}
                        </p>
                      </button>
                    ))
                  ) : (
                    <p className="text-xs text-zinc-500">No jobs in this state.</p>
                  )}
                </div>
              </div>
            ))}
            {statusSnapshot.buckets.other.length ? (
              <div className="space-y-3">
                <div className="flex items-center justify-between text-xs uppercase tracking-[0.3em] text-zinc-500">
                  <span>{statusTileMeta.other.heading}</span>
                  <Badge variant="muted">{statusSnapshot.buckets.other.length} job{statusSnapshot.buckets.other.length === 1 ? "" : "s"}</Badge>
                </div>
                <div className="space-y-2">
                  {statusSnapshot.buckets.other.map((job) => (
                    <button
                      key={job.id}
                      type="button"
                      onClick={() => setSelectedId(job.id)}
                      aria-pressed={selectedId === job.id}
                      aria-label={`View job ${job.name}`}
                      className={`w-full rounded-xl border p-3 text-left transition-colors ${
                        selectedId === job.id
                          ? "border-zinc-900 bg-zinc-900 text-zinc-50 dark:border-zinc-100 dark:bg-zinc-100 dark:text-zinc-900"
                          : "border-zinc-200 bg-zinc-50 hover:bg-zinc-100 dark:border-zinc-800 dark:bg-zinc-900 dark:hover:bg-zinc-800"
                      }`}
                    >
                      <div className="flex items-center justify-between gap-2">
                        <p className="text-sm font-semibold">{job.name}</p>
                        {statusPill(job.status)}
                      </div>
                      <p className="mt-1 text-sm text-zinc-500">{job.purpose ?? "No purpose provided"}</p>
                      <p className="mt-2 text-xs font-semibold uppercase tracking-[0.2em] text-zinc-500">
                        Next: {job.nextRun ?? (job.nextRunAt ? formatDateTime(job.nextRunAt) : "—")}
                      </p>
                    </button>
                  ))}
                </div>
              </div>
            ) : null}
          </CardContent>
        </Card>

        {selectedJob ? (
          <div className="space-y-5">
            <Card>
              <CardHeader className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                <div>
                  <CardTitle>Job snapshot</CardTitle>
                  <CardDescription>Read-only context for the scheduler state.</CardDescription>
                </div>
                <Badge variant="muted" className="text-[0.65rem] uppercase tracking-[0.3em]">
                  Read only
                </Badge>
              </CardHeader>
              <CardContent className="space-y-5">
                <div className="flex flex-wrap items-center gap-2">
                  {statusPill(selectedJob.status)}
                  <Badge variant="muted">Owner: {selectedJob.owner ?? "—"}</Badge>
                </div>
                <div className="rounded-2xl border border-zinc-200/80 bg-zinc-50 p-4 text-sm text-zinc-700 dark:border-zinc-800/80 dark:bg-zinc-950 dark:text-zinc-300">
                  <p className="text-xs text-zinc-500 dark:text-zinc-400">Purpose</p>
                  <p className="mt-2 text-base text-zinc-900 dark:text-zinc-100">
                    {selectedJob.purpose ?? "No purpose provided"}
                  </p>
                </div>
                <div className="grid gap-4 md:grid-cols-2">
                  <OverviewItem label="Schedule" value={scheduleLabel} icon={<CalendarClock className="size-4" />} />
                  <OverviewItem
                    label="Next run"
                    value={nextRunLabel}
                    helper={selectedJob.nextRunAt ? formatDateTime(selectedJob.nextRunAt) : undefined}
                    icon={<Clock3 className="size-4" />}
                  />
                  <OverviewItem label="Created" value={formatDateTime(selectedJob.createdAt)} />
                  <OverviewItem label="Updated" value={formatDateTime(selectedJob.updatedAt)} />
                  <OverviewItem label="Last output" value={selectedJob.lastOutputId ?? "—"} />
                </div>
                <div className="rounded-2xl border border-zinc-200/80 bg-white p-4 text-sm text-zinc-700 dark:border-zinc-800/80 dark:bg-zinc-950 dark:text-zinc-300">
                  <div className="flex items-center justify-between">
                    <p className="text-xs font-semibold uppercase tracking-[0.3em] text-zinc-500">Latest run</p>
                    {latestHistory ? historyBadge(latestHistory.status) : <Badge variant="muted">Waiting</Badge>}
                  </div>
                  <p className="mt-2 text-base font-semibold text-zinc-900 dark:text-zinc-100">
                    {latestHistory ? latestHistory.summary ?? "Run completed" : "Awaiting the first run"}
                  </p>
                  {latestHistory ? (
                    <div className="mt-1 grid gap-1 text-xs text-zinc-500 dark:text-zinc-400">
                      <span>Started {formatDateTime(latestHistory.startedAt)}</span>
                      <span>Duration {formatDuration(latestHistory.durationMs)}</span>
                      {latestHistory.finishedAt ? <span>Finished {formatDateTime(latestHistory.finishedAt)}</span> : null}
                      {latestHistory.outputId ? <span>Output {latestHistory.outputId}</span> : null}
                    </div>
                  ) : (
                    <p className="mt-1 text-xs text-zinc-500 dark:text-zinc-400">Runs will appear here once this schedule executes.</p>
                  )}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-col gap-2">
                <div className="flex items-center justify-between gap-3">
                  <div className="flex items-center gap-2">
                    <History className="size-4 text-zinc-500" />
                    <CardTitle className="m-0">Job history</CardTitle>
                  </div>
                  <Button variant="ghost" size="sm" onClick={refreshJobHistory}>
                    Refresh history
                  </Button>
                </div>
                <CardDescription>Recent runs for {selectedJob.name}.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex flex-wrap gap-2">
                  {HISTORY_STATUS_ORDER.filter((state) => historyStatusSummary[state]).map((state) => (
                    <Badge key={state} variant="muted" className="text-[0.65rem] uppercase tracking-[0.3em]">
                      {historyStatusSummary[state]} {state}
                    </Badge>
                  ))}
                </div>
                {historyStatus === "loading" ? (
                  <LoadingState title="Loading history" description="Gathering recent job runs…" />
                ) : historyStatus === "error" ? (
                  <ErrorState
                    title="Unable to load history"
                    description={historyError ?? "Try refreshing this list."}
                    action={
                      <Button variant="ghost" onClick={refreshJobHistory}>
                        Retry
                      </Button>
                    }
                  />
                ) : sortedHistory.length ? (
                  sortedHistory.map((entry) => (
                    <div
                      key={entry.id}
                      className="rounded-2xl border border-zinc-200 bg-zinc-50/80 px-4 py-3 dark:border-zinc-800/80 dark:bg-zinc-900"
                    >
                      <div className="flex items-center justify-between gap-2">
                        <p className="flex items-center gap-1 text-xs text-zinc-500 dark:text-zinc-400">
                          <Clock3 className="size-3" />
                          {formatDateTime(entry.startedAt)}
                        </p>
                        {historyBadge(entry.status)}
                      </div>
                      <p className="mt-1 text-base font-semibold text-zinc-900 dark:text-zinc-100">
                        {entry.summary ?? "Run completed"}
                      </p>
                      <div className="mt-1 flex flex-wrap gap-3 text-xs text-zinc-500 dark:text-zinc-400">
                        <span>Duration {formatDuration(entry.durationMs)}</span>
                        {entry.finishedAt ? <span>Finished {formatDateTime(entry.finishedAt)}</span> : null}
                        {entry.outputId ? <span>Output {entry.outputId}</span> : null}
                      </div>
                      {entry.reason ? (
                        <p className="mt-2 text-xs text-rose-600 dark:text-rose-300">Reason: {entry.reason}</p>
                      ) : null}
                    </div>
                  ))
                ) : (
                  <EmptyState
                    title="No history yet"
                    description="This job will populate history entries once runs complete."
                    action={
                      <Button variant="ghost" onClick={refreshJobHistory}>
                        Refresh
                      </Button>
                    }
                  />
                )}
              </CardContent>
            </Card>
          </div>
        ) : null}
      </div>
    </div>
  );
}
