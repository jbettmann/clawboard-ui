import { Activity, Archive, CheckCircle2, CircleAlert, Clock3, History, Timer } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

const snapshot = [
  { label: "Overall system", value: "Stable", tone: "good" },
  { label: "Queue load", value: "Light", tone: "neutral" },
  { label: "Connections", value: "1 needs attention", tone: "watch" },
  { label: "Failed jobs", value: "0 today", tone: "good" },
] as const;

const recentTimeline = [
  {
    time: "08:12",
    title: "Morning brief delivered",
    detail: "Sent with priorities and reminders.",
    tone: "good",
  },
  {
    time: "08:03",
    title: "Connection auth requested",
    detail: "Android companion session asked for re-pair.",
    tone: "watch",
  },
  {
    time: "07:55",
    title: "Heartbeat check completed",
    detail: "Inbox and reminders checked with no critical items.",
    tone: "good",
  },
  {
    time: "Yesterday",
    title: "Evening wrap archived",
    detail: "Summary saved to history with completion marker.",
    tone: "neutral",
  },
] as const;

const logDigest = [
  "Most sessions completed without retries.",
  "Average task completion time improved vs. yesterday.",
  "No crash loops or repeated connection failures detected.",
];

export function StatusHistory() {
  return (
    <div className="space-y-5 pb-6">
      <Card>
        <CardHeader>
          <Badge variant="muted">Phase 5 · Status & History</Badge>
          <CardTitle className="mt-3 flex items-center gap-2 text-2xl">
            <Activity className="size-5 text-[var(--color-accent-primary)]" />
            Status and history
          </CardTitle>
          <CardDescription className="text-base">
            Glanceable health, activity timeline, and plain-language log digest.
          </CardDescription>
        </CardHeader>
      </Card>

      <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-4">
        {snapshot.map((item) => (
          <Card key={item.label}>
            <CardHeader>
              <CardDescription>{item.label}</CardDescription>
              <CardTitle className="text-2xl">
                <span
                  className={
                    item.tone === "good"
                      ? "text-emerald-700 dark:text-emerald-300"
                      : item.tone === "watch"
                        ? "text-amber-700 dark:text-amber-300"
                        : "text-zinc-800 dark:text-zinc-100"
                  }
                >
                  {item.value}
                </span>
              </CardTitle>
            </CardHeader>
          </Card>
        ))}
      </div>

      <div className="grid gap-5 xl:grid-cols-[1.2fr_1fr]">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <History className="size-4 text-zinc-500" />
              Activity timeline
            </CardTitle>
            <CardDescription>Recent events in friendly language rather than raw debug logs.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {recentTimeline.map((item) => (
              <div
                key={`${item.time}-${item.title}`}
                className="rounded-xl border border-zinc-200 bg-zinc-50 p-4 dark:border-zinc-800 dark:bg-zinc-900"
              >
                <p className="flex items-center gap-2 text-sm text-zinc-500 dark:text-zinc-400">
                  <Clock3 className="size-4" />
                  {item.time}
                </p>
                <p className="mt-1 flex items-center gap-2 text-base font-medium text-zinc-900 dark:text-zinc-100">
                  {item.tone === "good" ? (
                    <CheckCircle2 className="size-4 text-emerald-500" />
                  ) : item.tone === "watch" ? (
                    <CircleAlert className="size-4 text-amber-500" />
                  ) : (
                    <Timer className="size-4 text-zinc-500" />
                  )}
                  {item.title}
                </p>
                <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">{item.detail}</p>
              </div>
            ))}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Archive className="size-4 text-zinc-500" />
              Log digest
            </CardTitle>
            <CardDescription>Short summary of what logs mean today.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {logDigest.map((line) => (
              <p
                key={line}
                className="rounded-xl border border-zinc-200 bg-zinc-50 px-4 py-3 text-sm text-zinc-700 dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-300"
              >
                {line}
              </p>
            ))}
            <p className="rounded-xl border border-dashed border-zinc-300 bg-zinc-50 px-4 py-3 text-sm text-zinc-700 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-300">
              This view keeps useful trends and outcomes visible without exposing low-level system noise.
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
