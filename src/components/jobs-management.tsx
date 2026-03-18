"use client";

import { useEffect, useMemo, useState } from "react";
import { CalendarClock } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { PageHeader } from "@/components/page-header";
import { EmptyState, ErrorState, LoadingState } from "@/components/ui/async-states";
import { fetchJobs, Job, JobStatus } from "@/lib/openclaw-client";
import { useOpenClawResource } from "@/hooks/use-openclaw-resource";

function statusPill(status: JobStatus) {
  if (status === "running") return <Badge className="bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-300">Running</Badge>;
  if (status === "paused") return <Badge className="bg-zinc-200 text-zinc-700 dark:bg-zinc-800 dark:text-zinc-200">Paused</Badge>;
  return <Badge variant="muted">Scheduled</Badge>;
}

export function JobsManagement() {
  const { status, data, error, refresh } = useOpenClawResource<Job[]>(fetchJobs, []);
  const [selectedId, setSelectedId] = useState<string | null>(null);

  const jobs = useMemo(() => data ?? [], [data]);

  useEffect(() => {
    if (status !== "success" || !jobs.length) {
      return;
    }

    const timer = setTimeout(() => {
      setSelectedId((prev) => (prev && jobs.some((job) => job.id === prev) ? prev : jobs[0].id));
    }, 0);

    return () => {
      clearTimeout(timer);
    };
  }, [status, jobs]);

  const selectedJob = useMemo(() => {
    if (!jobs.length) return null;
    return jobs.find((job) => job.id === selectedId) ?? jobs[0];
  }, [jobs, selectedId]);

  const header = (
    <PageHeader
      title="Jobs management"
      context="Clear schedules with live status from your OpenClaw workflow."
      supportingStatus={
        <>
          <Badge variant="muted">{jobs.length} job{jobs.length === 1 ? "" : "s"}</Badge>
          {selectedJob ? statusPill(selectedJob.status) : <Badge variant="muted">{status === "loading" ? "Refreshing" : "No selection"}</Badge>}
          {selectedJob ? <Badge variant="muted">Next: {selectedJob.nextRun}</Badge> : <Badge variant="muted">Awaiting data</Badge>}
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
      <div className="space-y-5 pb-6">
        {header}
        <LoadingState title="Loading jobs" description="Fetching live scheduler data from OpenClaw…" />
      </div>
    );
  }

  if (status === "error") {
    return (
      <div className="space-y-5 pb-6">
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
      <div className="space-y-5 pb-6">
        {header}
        <EmptyState
          title="No jobs to show"
          description="The scheduler returned an empty set."
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
    <div className="space-y-5 pb-6">
      {header}

      <div className="grid gap-5 lg:grid-cols-[320px_1fr]">
        <Card>
          <CardHeader>
            <CardTitle>Job list</CardTitle>
            <CardDescription>Pick a job to inspect schedule and timing.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-2">
            {jobs.map((job) => (
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
                <p className="mt-1 text-sm opacity-85">{job.purpose}</p>
                <p className="mt-2 text-xs opacity-80">Next: {job.nextRun}</p>
              </button>
            ))}
          </CardContent>
        </Card>

        {selectedJob ? (
          <Card>
            <CardHeader>
              <CardTitle>Job details</CardTitle>
              <CardDescription>View schedule, purpose, and ownership without editing.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
                <div className="rounded-xl border border-zinc-200/80 bg-zinc-50 p-4 dark:border-zinc-800/80 dark:bg-zinc-900">
                  <p className="text-xs text-zinc-500 dark:text-zinc-400">Job name</p>
                  <p className="mt-1 text-lg font-semibold text-zinc-900 dark:text-zinc-100">{selectedJob.name}</p>
                </div>
                <div className="rounded-xl border border-zinc-200/80 bg-zinc-50 p-4 dark:border-zinc-800/80 dark:bg-zinc-900">
                  <p className="text-xs text-zinc-500 dark:text-zinc-400">Owner</p>
                  <p className="mt-1 text-lg font-semibold text-zinc-900 dark:text-zinc-100">{selectedJob.owner}</p>
                </div>
              </div>

              <div className="rounded-xl border border-zinc-200/80 bg-white p-4 text-sm text-zinc-700 dark:border-zinc-800 dark:bg-zinc-950 dark:text-zinc-300">
                <p className="text-xs text-zinc-500 dark:text-zinc-400">Purpose</p>
                <p className="mt-1 text-base text-zinc-900 dark:text-zinc-100">{selectedJob.purpose}</p>
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <div className="rounded-xl border border-zinc-200/80 bg-white p-4 text-sm text-zinc-700 dark:border-zinc-800 dark:bg-zinc-950 dark:text-zinc-300">
                  <p className="text-xs text-zinc-500 dark:text-zinc-400">Schedule</p>
                  <p className="mt-1 flex items-center gap-2 text-base text-zinc-900 dark:text-zinc-100">
                    <CalendarClock className="size-4 text-zinc-500" />
                    {selectedJob.scheduleText}
                  </p>
                </div>
                <div className="rounded-xl border border-zinc-200/80 bg-white p-4 text-sm text-zinc-700 dark:border-zinc-800 dark:bg-zinc-950 dark:text-zinc-300">
                  <p className="text-xs text-zinc-500 dark:text-zinc-400">Next run</p>
                  <p className="mt-1 text-base text-zinc-900 dark:text-zinc-100">{selectedJob.nextRun}</p>
                </div>
              </div>

              <div className="flex flex-wrap items-center gap-2">
                {statusPill(selectedJob.status)}
                <Badge variant="muted">Schedule text: {selectedJob.scheduleText}</Badge>
              </div>
            </CardContent>
          </Card>
        ) : null}
      </div>
    </div>
  );
}
