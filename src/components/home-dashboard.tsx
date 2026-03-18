import Link from "next/link";
import {
  AlarmClock,
  ArrowRight,
  CheckCircle2,
  CircleDashed,
  Clock3,
  FileText,
  Pin,
  PlayCircle,
  Sparkles,
  Sun,
  Timer,
  TriangleAlert,
} from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

type StatusTone = "good" | "watch" | "neutral";

const systemSignals: Array<{ label: string; value: string; tone: StatusTone }> = [
  { label: "Node connection", value: "Healthy", tone: "good" },
  { label: "Inbox triage", value: "2 items", tone: "watch" },
  { label: "Reminders", value: "On track", tone: "good" },
  { label: "Background load", value: "Light", tone: "neutral" },
];

const todayJobs = [
  {
    title: "Daily investment radar",
    detail: "Draft ready. Needs final review before 08:30.",
    eta: "12 min",
    priority: "Today",
  },
  {
    title: "Node pairing follow-up",
    detail: "One device needs reconnect instructions.",
    eta: "18 min",
    priority: "Soon",
  },
  {
    title: "Evening summary",
    detail: "Auto-run at 20:00 with calm digest format.",
    eta: "Scheduled",
    priority: "Later",
  },
];

const pinnedOutputs = [
  {
    title: "Morning Brief — Wednesday",
    meta: "Updated 6 minutes ago",
    href: "/outputs",
  },
  {
    title: "Home Security Healthcheck",
    meta: "Last run yesterday",
    href: "/outputs",
  },
  {
    title: "Weekly Project Priorities",
    meta: "Pinned this week",
    href: "/outputs",
  },
];

const quickActions = [
  { label: "Start Morning Brief", icon: Sun, href: "/chat" },
  { label: "Review Active Jobs", icon: PlayCircle, href: "/jobs" },
  { label: "Open Latest Outputs", icon: FileText, href: "/outputs" },
  { label: "Tune Connections", icon: CircleDashed, href: "/connections" },
];

function signalToneIcon(tone: StatusTone) {
  if (tone === "good") return CheckCircle2;
  if (tone === "watch") return TriangleAlert;
  return CircleDashed;
}

export function HomeDashboard() {
  const today = new Date();
  const dateText = new Intl.DateTimeFormat("en-US", {
    weekday: "long",
    month: "long",
    day: "numeric",
  }).format(today);

  return (
    <div className="space-y-5 pb-6">
      <Card className="border-zinc-200/90 bg-white dark:bg-zinc-900/80">
        <CardHeader className="space-y-4">
          <div className="flex flex-wrap items-center gap-2">
            <Badge variant="muted" className="text-[11px]">Home Dashboard</Badge>
            <Badge className="bg-sky-100 text-sky-800 dark:bg-sky-900/30 dark:text-sky-300">Calm Mode</Badge>
          </div>

          <div className="space-y-2">
            <CardTitle className="text-3xl font-semibold leading-tight text-zinc-900 dark:text-zinc-50">
              Good morning. Here is your day at a glance.
            </CardTitle>
            <CardDescription className="flex items-center gap-2 text-base">
              <Clock3 className="size-4" />
              {dateText} · Everything important is in one quiet place.
            </CardDescription>
          </div>
        </CardHeader>
      </Card>

      <div className="grid gap-5 lg:grid-cols-[1.45fr_1fr]">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-xl">
              <Sparkles className="size-5 text-sky-500" />
              Morning brief
            </CardTitle>
            <CardDescription className="text-base">
              A short pulse check so you can focus on what matters next.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-3 sm:grid-cols-2">
              {systemSignals.map((item) => {
                const Icon = signalToneIcon(item.tone);
                return (
                  <div
                    key={item.label}
                    className="rounded-xl border border-zinc-200/80 bg-zinc-50/80 p-4 dark:border-zinc-800/80 dark:bg-zinc-900"
                  >
                    <p className="text-sm text-zinc-500 dark:text-zinc-400">{item.label}</p>
                    <div className="mt-2 flex items-center gap-2">
                      <Icon className="size-4 text-zinc-500 dark:text-zinc-300" />
                      <span className="text-lg font-medium text-zinc-900 dark:text-zinc-100">{item.value}</span>
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="rounded-xl border border-zinc-200/80 bg-white p-4 dark:border-zinc-800/80 dark:bg-zinc-900">
              <p className="text-sm text-zinc-500 dark:text-zinc-400">Next reminder</p>
              <p className="mt-1 flex items-center gap-2 text-lg font-medium text-zinc-900 dark:text-zinc-100">
                <AlarmClock className="size-4 text-zinc-500" />
                Team sync in 42 minutes
              </p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-xl">Quick actions</CardTitle>
            <CardDescription className="text-base">Simple starts for common routines.</CardDescription>
          </CardHeader>
          <CardContent className="grid gap-3">
            {quickActions.map((item) => {
              const Icon = item.icon;
              return (
                <Button key={item.label} asChild variant="secondary" className="h-12 justify-between px-4 text-base">
                  <Link href={item.href}>
                    <span className="flex items-center gap-2">
                      <Icon className="size-4" />
                      {item.label}
                    </span>
                    <ArrowRight className="size-4" />
                  </Link>
                </Button>
              );
            })}
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-5 xl:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-xl">
              <Timer className="size-5 text-zinc-500" />
              Active jobs
            </CardTitle>
            <CardDescription className="text-base">A gentle queue view with clear timing.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {todayJobs.map((job) => (
              <div
                key={job.title}
                className="rounded-xl border border-zinc-200/80 bg-zinc-50/70 p-4 dark:border-zinc-800/80 dark:bg-zinc-900"
              >
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <h3 className="text-base font-medium text-zinc-900 dark:text-zinc-100">{job.title}</h3>
                  <span className={
                    `rounded-full px-2.5 py-1 text-xs font-medium ${job.priority === "Soon" ? "bg-amber-100 text-amber-800 dark:bg-amber-900/35 dark:text-amber-300" : "bg-zinc-100 text-zinc-700 dark:bg-zinc-800 dark:text-zinc-200"}`
                  }>
                    {job.priority}
                  </span>
                </div>
                <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">{job.detail}</p>
                <p className="mt-2 text-sm font-medium text-zinc-700 dark:text-zinc-300">ETA: {job.eta}</p>
              </div>
            ))}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-xl">
              <Pin className="size-5 text-zinc-500" />
              Pinned outputs
            </CardTitle>
            <CardDescription className="text-base">Your most useful references, always visible.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {pinnedOutputs.map((item) => (
              <Link
                key={item.title}
                href={item.href}
                className="flex items-center justify-between rounded-xl border border-zinc-200/80 bg-zinc-50/70 px-4 py-3 text-sm transition-colors hover:bg-zinc-100 dark:border-zinc-800/80 dark:bg-zinc-900 dark:hover:bg-zinc-800"
              >
                <div>
                  <p className="text-base font-medium text-zinc-900 dark:text-zinc-100">{item.title}</p>
                  <p className="text-sm text-zinc-600 dark:text-zinc-400">{item.meta}</p>
                </div>
                <ArrowRight className="size-4 text-zinc-500" />
              </Link>
            ))}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
