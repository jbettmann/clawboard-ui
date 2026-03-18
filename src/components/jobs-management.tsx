"use client";

import { useState } from "react";
import { CalendarClock, CirclePause, Play, RefreshCcw, SquarePlay, TimerReset, Wrench } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

type JobStatus = "running" | "scheduled" | "paused";

type Job = {
  id: string;
  name: string;
  purpose: string;
  scheduleText: string;
  nextRun: string;
  status: JobStatus;
  owner: string;
};

const initialJobs: Job[] = [
  {
    id: "morning-brief",
    name: "Morning Brief",
    purpose: "Prepare a short morning summary and priority list.",
    scheduleText: "Every weekday at 7:30 AM",
    nextRun: "Tomorrow, 7:30 AM",
    status: "scheduled",
    owner: "Plato",
  },
  {
    id: "heartbeat-check",
    name: "Heartbeat Check",
    purpose: "Check key alerts and inbox for urgent updates.",
    scheduleText: "Every 4 hours between 8:00 AM and 8:00 PM",
    nextRun: "Today, 12:00 PM",
    status: "running",
    owner: "Plato",
  },
  {
    id: "evening-wrap",
    name: "Evening Wrap",
    purpose: "Send a calm end-of-day summary with tomorrow prep.",
    scheduleText: "Every day at 8:00 PM",
    nextRun: "Paused",
    status: "paused",
    owner: "Plato",
  },
];

function statusPill(status: JobStatus) {
  if (status === "running") return <Badge className="bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-300">Running</Badge>;
  if (status === "paused") return <Badge className="bg-zinc-200 text-zinc-700 dark:bg-zinc-800 dark:text-zinc-200">Paused</Badge>;
  return <Badge variant="muted">Scheduled</Badge>;
}

function scheduleHint(text: string) {
  const lower = text.toLowerCase();
  if (lower.includes("weekday")) return "Runs Monday through Friday only.";
  if (lower.includes("every day") || lower.includes("daily")) return "Runs all seven days each week.";
  if (lower.includes("every ")) return "Repeats on an interval using your plain-language rule.";
  return "Use plain language like: Every day at 8:00 PM.";
}

export function JobsManagement() {
  const [jobs, setJobs] = useState<Job[]>(initialJobs);
  const [selectedId, setSelectedId] = useState<string>(initialJobs[0].id);
  const [editedJob, setEditedJob] = useState<Job>(initialJobs[0]);
  const [activityNote, setActivityNote] = useState<string>("No recent action");

  function selectJob(id: string) {
    const found = jobs.find((item) => item.id === id);
    if (!found) return;
    setSelectedId(id);
    setEditedJob(found);
    setActivityNote("Viewing selected job");
  }

  function updateField<K extends keyof Job>(key: K, value: Job[K]) {
    setEditedJob((prev) => ({ ...prev, [key]: value }));
  }

  function persist(note: string) {
    setJobs((prev) => prev.map((item) => (item.id === editedJob.id ? editedJob : item)));
    setActivityNote(note);
  }

  function runNow() {
    const updated: Job = { ...editedJob, status: "running", nextRun: "Running now" };
    setEditedJob(updated);
    setJobs((prev) => prev.map((item) => (item.id === updated.id ? updated : item)));
    setActivityNote("Run started now");
  }

  function pauseJob() {
    const updated: Job = { ...editedJob, status: "paused", nextRun: "Paused" };
    setEditedJob(updated);
    setJobs((prev) => prev.map((item) => (item.id === updated.id ? updated : item)));
    setActivityNote("Job paused");
  }

  function resumeJob() {
    const updated: Job = { ...editedJob, status: "scheduled", nextRun: "Today, 6:00 PM" };
    setEditedJob(updated);
    setJobs((prev) => prev.map((item) => (item.id === updated.id ? updated : item)));
    setActivityNote("Job resumed with next run today");
  }

  function skipNext() {
    const updated: Job = { ...editedJob, nextRun: "Skipped once · next after that" };
    setEditedJob(updated);
    setJobs((prev) => prev.map((item) => (item.id === updated.id ? updated : item)));
    setActivityNote("Next scheduled run skipped");
  }

  return (
    <div className="space-y-5 pb-6">
      <Card>
        <CardHeader>
          <Badge variant="muted">Phase 3 · Jobs</Badge>
          <CardTitle className="mt-3 flex items-center gap-2 text-2xl">
            <Wrench className="size-5 text-[var(--color-accent-primary)]" />
            Jobs management
          </CardTitle>
          <CardDescription className="text-base">
            Keep recurring work clear and editable with plain-language schedules and obvious controls.
          </CardDescription>
        </CardHeader>
      </Card>

      <div className="grid gap-5 lg:grid-cols-[320px_1fr]">
        <Card>
          <CardHeader>
            <CardTitle>Job list</CardTitle>
            <CardDescription>Pick a job to inspect schedule and actions.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-2">
            {jobs.map((job) => (
              <button
                key={job.id}
                type="button"
                onClick={() => selectJob(job.id)}
                aria-pressed={selectedId === job.id}
                aria-label={`Edit job ${job.name}`}
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

        <Card>
          <CardHeader>
            <CardTitle>Job details</CardTitle>
            <CardDescription>Edit purpose and schedule in plain language.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
              <label className="space-y-2">
                <span className="text-sm font-medium text-zinc-700 dark:text-zinc-300">Job name</span>
                <input
                  value={editedJob.name}
                  onChange={(e) => updateField("name", e.target.value)}
                  className="h-11 w-full rounded-lg border border-zinc-300 bg-white px-3 text-base outline-none focus:ring-2 focus:ring-zinc-400 dark:border-zinc-700 dark:bg-zinc-950"
                />
              </label>

              <label className="space-y-2">
                <span className="text-sm font-medium text-zinc-700 dark:text-zinc-300">Owner</span>
                <input
                  value={editedJob.owner}
                  onChange={(e) => updateField("owner", e.target.value)}
                  className="h-11 w-full rounded-lg border border-zinc-300 bg-white px-3 text-base outline-none focus:ring-2 focus:ring-zinc-400 dark:border-zinc-700 dark:bg-zinc-950"
                />
              </label>
            </div>

            <label className="space-y-2">
              <span className="text-sm font-medium text-zinc-700 dark:text-zinc-300">Purpose</span>
              <textarea
                value={editedJob.purpose}
                onChange={(e) => updateField("purpose", e.target.value)}
                rows={3}
                className="w-full rounded-lg border border-zinc-300 bg-white px-3 py-2 text-base outline-none focus:ring-2 focus:ring-zinc-400 dark:border-zinc-700 dark:bg-zinc-950"
              />
            </label>

            <label className="space-y-2">
              <span className="text-sm font-medium text-zinc-700 dark:text-zinc-300">Schedule (plain language)</span>
              <input
                value={editedJob.scheduleText}
                onChange={(e) => updateField("scheduleText", e.target.value)}
                className="h-11 w-full rounded-lg border border-zinc-300 bg-white px-3 text-base outline-none focus:ring-2 focus:ring-zinc-400 dark:border-zinc-700 dark:bg-zinc-950"
                placeholder="Every weekday at 7:30 AM"
              />
            </label>

            <div className="rounded-xl border border-zinc-200 bg-zinc-50 p-4 dark:border-zinc-800 dark:bg-zinc-900">
              <p className="flex items-center gap-2 text-base font-medium text-zinc-900 dark:text-zinc-100">
                <CalendarClock className="size-4 text-zinc-500" />
                Schedule interpretation
              </p>
              <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">{scheduleHint(editedJob.scheduleText)}</p>
              <p className="mt-2 text-sm font-medium text-zinc-700 dark:text-zinc-300">Next run: {editedJob.nextRun}</p>
            </div>

            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
              <Button onClick={runNow} className="h-11 text-base">
                <Play className="size-4" />
                Run now
              </Button>
              <Button onClick={pauseJob} variant="secondary" className="h-11 text-base">
                <CirclePause className="size-4" />
                Pause
              </Button>
              <Button onClick={resumeJob} variant="secondary" className="h-11 text-base">
                <SquarePlay className="size-4" />
                Resume
              </Button>
              <Button onClick={skipNext} variant="secondary" className="h-11 text-base">
                <TimerReset className="size-4" />
                Skip next
              </Button>
            </div>

            <div className="flex flex-wrap items-center gap-3">
              <Button onClick={() => persist("Job details saved")} className="h-11 px-5 text-base">
                <RefreshCcw className="size-4" />
                Save changes
              </Button>
              <p className="text-sm text-zinc-500 dark:text-zinc-400" aria-live="polite">
                {activityNote}
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
