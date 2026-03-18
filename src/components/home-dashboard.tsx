"use client";

import Link from "next/link";
import { useRef } from "react";
import {
  AlarmClock,
  ArrowDown,
  ArrowRight,
  ArrowUp,
  CheckCircle2,
  CircleDashed,
  FileText,
  Pin,
  PlayCircle,
  Settings2,
  Sparkles,
  Sun,
  Timer,
  TriangleAlert,
} from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { PageHeader } from "@/components/page-header";
import { HomeWidgetId, useClawboardState } from "@/lib/clawboard-state";

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
  const { outputs, widgetPreferences, moveWidget, toggleWidgetVisibility } = useClawboardState();

  const pinnedOutputs = outputs.filter((item) => item.pinned);
  const visibleWidgets = widgetPreferences.filter((item) => item.visible);
  const customizationRef = useRef<HTMLDivElement | null>(null);

  function focusCustomization() {
    customizationRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
  }

  function renderWidget(id: HomeWidgetId) {
    if (id === "morning-brief") {
      return (
        <Card key={id}>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-xl">
              <Sparkles className="size-5 text-[var(--color-accent-primary)]" />
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
      );
    }

    if (id === "quick-actions") {
      return (
        <Card key={id}>
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
                  <span
                    className={`rounded-full px-2.5 py-1 text-xs font-medium ${
                      job.priority === "Soon"
                        ? "bg-amber-100 text-amber-800 dark:bg-amber-900/35 dark:text-amber-300"
                        : "bg-zinc-100 text-zinc-700 dark:bg-zinc-800 dark:text-zinc-200"
                    }`}
                  >
                    {job.priority}
                  </span>
                </div>
                <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">{job.detail}</p>
                <p className="mt-2 text-sm font-medium text-zinc-700 dark:text-zinc-300">ETA: {job.eta}</p>
              </div>
            ))}
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
          <CardDescription className="text-base">Your most useful references, always visible.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          {pinnedOutputs.length ? (
            pinnedOutputs.map((item) => (
              <Link
                key={item.id}
                href="/outputs"
                className="flex items-center justify-between rounded-xl border border-zinc-200/80 bg-zinc-50/70 px-4 py-3 text-sm transition-colors hover:bg-zinc-100 dark:border-zinc-800/80 dark:bg-zinc-900 dark:hover:bg-zinc-800"
              >
                <div>
                  <p className="text-base font-medium text-zinc-900 dark:text-zinc-100">{item.title}</p>
                  <p className="text-sm text-zinc-600 dark:text-zinc-400">Updated {item.updatedAt}</p>
                </div>
                <ArrowRight className="size-4 text-zinc-500" />
              </Link>
            ))
          ) : (
            <p className="rounded-xl border border-dashed border-zinc-300 bg-zinc-50 p-4 text-sm text-zinc-600 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-300">
              No outputs are pinned yet. Open Outputs and use “Pin to Home” to add your most useful items here.
            </p>
          )}
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-5 pb-6">
      <PageHeader
        title="Home dashboard"
        context="Calm, clear signals for today plus quick actions and personalization."
        supportingStatus={
          <>
            <Badge variant="muted">Daily companion</Badge>
            <Badge>Calm mode</Badge>
          </>
        }
        primaryAction={
          <Button onClick={focusCustomization} size="lg" variant="secondary">
            Customize home
          </Button>
        }
      />

      <div ref={customizationRef}>
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-xl">
              <Settings2 className="size-5 text-zinc-500" />
              Customize Home
            </CardTitle>
            <CardDescription className="text-base">
              Show or hide sections and move them up or down. Changes save automatically.
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

      {visibleWidgets.length === 0 ? (
        <Card>
          <CardContent className="pt-6">
            <p className="rounded-xl border border-dashed border-zinc-300 bg-zinc-50 p-4 text-base text-zinc-700 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-300">
              All widgets are hidden. Use “Customize Home” above and switch one back to “Shown”.
            </p>
          </CardContent>
        </Card>
      ) : null}

      <div className="grid gap-5 xl:grid-cols-2">{visibleWidgets.map((widget) => renderWidget(widget.id))}</div>
    </div>
  );
}
