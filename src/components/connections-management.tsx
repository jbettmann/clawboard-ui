"use client";

import { useMemo, useState } from "react";
import { BadgeCheck, CheckCircle2, CircleAlert, HeartPulse, RefreshCcw, ShieldCheck } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { EmptyState, ErrorState, LoadingState } from "@/components/ui/async-states";
import { PageHeader } from "@/components/page-header";
import { fetchConnections, type Connection } from "@/lib/openclaw-client";
import { getOpenClawCompatibilityConfig, resolveApiBaseUrl } from "@/lib/openclaw-compat";
import { useOpenClawResource } from "@/hooks/use-openclaw-resource";

function healthBadge(health: Connection["health"]) {
  if (health === "healthy") return <Badge className="bg-[var(--color-state-good)] text-[var(--color-surface-card)]">Healthy</Badge>;
  if (health === "attention") return <Badge className="bg-[var(--color-state-watch)] text-[var(--color-surface-card)]">Needs attention</Badge>;
  return <Badge variant="muted">Offline</Badge>;
}

function authLabel(state: Connection["auth"]) {
  if (state === "connected") return "Signed in";
  if (state === "needs-auth") return "Re-auth required";
  return "Not connected";
}

export function ConnectionsManagement() {
  const { status, data, error, refresh } = useOpenClawResource<Connection[]>(fetchConnections, []);
  const connections = useMemo(() => data ?? [], [data]);
  const [selectedId, setSelectedId] = useState<string | null>(null);

  const activeConnectionId = selectedId ?? connections[0]?.id ?? null;
  const detailConnection = connections.find((item) => item.id === activeConnectionId) ?? connections[0] ?? null;
  const compat = getOpenClawCompatibilityConfig();

  const summary = useMemo(() => {
    const healthy = connections.filter((item) => item.health === "healthy").length;
    const attention = connections.filter((item) => item.health === "attention").length;
    const offline = connections.filter((item) => item.health === "offline").length;
    return { healthy, attention, offline };
  }, [connections]);

  const header = (
    <PageHeader
      title="Connections center"
      context="Live gateway and device health with step-by-step clarity."
      supportingStatus={
        <>
          {detailConnection ? healthBadge(detailConnection.health) : <Badge variant="muted">Awaiting data</Badge>}
          <Badge variant="muted">{detailConnection ? authLabel(detailConnection.auth) : "Auth status pending"}</Badge>
          {detailConnection ? <Badge variant="muted">Latency: {detailConnection.latency}</Badge> : null}
        </>
      }
      primaryAction={
        <Button onClick={refresh} size="lg" variant="secondary">
          <RefreshCcw className="size-4" />
          Refresh
        </Button>
      }
    />
  );

  if (status === "loading") {
    return (
      <div className="space-y-5 pb-6">
        {header}
        <LoadingState title="Loading connections" description="Fetching live gateway health from OpenClaw…" />
      </div>
    );
  }

  if (status === "error") {
    return (
      <div className="space-y-5 pb-6">
        {header}
        <ErrorState
          title="Unable to load connections"
          description={error ?? "Confirm OpenClaw is reachable and try refreshing."}
          action={
            <Button variant="ghost" onClick={refresh}>
              Retry
            </Button>
          }
        />
      </div>
    );
  }

  if (!connections.length) {
    return (
      <div className="space-y-5 pb-6">
        {header}
        <EmptyState
          title="No connections reported"
          description="OpenClaw has not shared any connection metadata yet."
          action={
            <Button variant="ghost" onClick={refresh}>
              Refresh
            </Button>
          }
        />
      </div>
    );
  }

  const steps = [
    {
      label: "1) Check sign-in",
      detail: detailConnection
        ? detailConnection.auth === "connected"
          ? "Signed in and valid."
          : "Authentication is required."
        : "Awaiting data.",
      ok: detailConnection?.auth === "connected",
    },
    {
      label: "2) Verify connection",
      detail: detailConnection?.health === "healthy" ? "Connection quality is stable." : "Investigate health or re-connect.",
      ok: detailConnection?.health === "healthy",
    },
    {
      label: "3) Confirm ready state",
      detail:
        detailConnection?.health === "healthy" && detailConnection?.auth === "connected"
          ? "This connection is ready to use."
          : "Resolve the steps above before relying on this node.",
      ok: detailConnection?.health === "healthy" && detailConnection?.auth === "connected",
    },
  ];

  return (
    <div className="space-y-5 pb-6">
      {header}

      <div className="grid gap-5 lg:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <HeartPulse className="size-4 text-zinc-500" />
              Health at a glance
            </CardTitle>
            <CardDescription>Signal counts pulled directly from OpenClaw.</CardDescription>
          </CardHeader>
          <CardContent className="grid gap-3">
            <div className="rounded-xl border border-emerald-200 bg-emerald-50 p-3 dark:border-emerald-900/40 dark:bg-emerald-950/20">
              <p className="text-xs text-emerald-700 dark:text-emerald-300">Healthy</p>
              <p className="mt-1 text-2xl font-semibold text-emerald-900 dark:text-emerald-100">{summary.healthy}</p>
            </div>
            <div className="rounded-xl border border-amber-200 bg-amber-50 p-3 dark:border-amber-900/40 dark:bg-amber-950/20">
              <p className="text-xs text-amber-700 dark:text-amber-300">Needs attention</p>
              <p className="mt-1 text-2xl font-semibold text-amber-900 dark:text-amber-100">{summary.attention}</p>
            </div>
            <div className="rounded-xl border border-zinc-300 bg-zinc-100 p-3 dark:border-zinc-700 dark:bg-zinc-900">
              <p className="text-xs text-zinc-600 dark:text-zinc-300">Offline</p>
              <p className="mt-1 text-2xl font-semibold text-zinc-900 dark:text-zinc-100">{summary.offline}</p>
            </div>
          </CardContent>
        </Card>

        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Connection list</CardTitle>
            <CardDescription>Choose a connection to inspect authentication and health.</CardDescription>
          </CardHeader>
          <CardContent className="grid gap-3 md:grid-cols-2">
            {connections.map((item) => (
              <button
                key={item.id}
                type="button"
                onClick={() => setSelectedId(item.id)}
                aria-pressed={activeConnectionId === item.id}
                aria-label={`Select connection ${item.name}`}
                className={`rounded-xl border p-4 text-left transition-colors ${
                  activeConnectionId === item.id
                    ? "border-zinc-900 bg-zinc-900 text-zinc-50 dark:border-zinc-100 dark:bg-zinc-100 dark:text-zinc-900"
                    : "border-zinc-200 bg-zinc-50 hover:bg-zinc-100 dark:border-zinc-800 dark:bg-zinc-900 dark:hover:bg-zinc-800"
                }`}
              >
                <div className="flex items-center justify-between gap-2">
                  <p className="text-base font-semibold">{item.name}</p>
                  {healthBadge(item.health)}
                </div>
                <p className="mt-1 text-sm opacity-85">{item.target}</p>
                <p className="mt-2 text-xs opacity-70">
                  {authLabel(item.auth)} · Last checked {item.lastChecked}
                </p>
              </button>
            ))}
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-5 xl:grid-cols-[1.15fr_1fr]">
        <Card>
          <CardHeader>
            <div className="flex flex-wrap items-center gap-2">
              {detailConnection ? healthBadge(detailConnection.health) : null}
              {detailConnection ? <Badge variant="muted">{detailConnection.type}</Badge> : null}
            </div>
            <CardTitle className="mt-3 text-2xl">{detailConnection?.name}</CardTitle>
            <CardDescription className="text-base">{detailConnection?.note}</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-3 md:grid-cols-3">
              <div className="rounded-xl border border-zinc-200 bg-zinc-50 p-3 dark:border-zinc-800 dark:bg-zinc-900">
                <p className="text-xs text-zinc-500">Auth status</p>
                <p className="mt-1 text-base font-medium text-zinc-900 dark:text-zinc-100">
                  {detailConnection ? authLabel(detailConnection.auth) : "—"}
                </p>
              </div>
              <div className="rounded-xl border border-zinc-200 bg-zinc-50 p-3 dark:border-zinc-800 dark:bg-zinc-900">
                <p className="text-xs text-zinc-500">Latency</p>
                <p className="mt-1 text-base font-medium text-zinc-900 dark:text-zinc-100">
                  {detailConnection?.latency ?? "—"}
                </p>
              </div>
              <div className="rounded-xl border border-zinc-200 bg-zinc-50 p-3 dark:border-zinc-800 dark:bg-zinc-900">
                <p className="text-xs text-zinc-500">Last checked</p>
                <p className="mt-1 text-base font-medium text-zinc-900 dark:text-zinc-100">
                  {detailConnection?.lastChecked ?? "—"}
                </p>
              </div>
            </div>

            <p className="text-sm text-zinc-500 dark:text-zinc-400" aria-live="polite">
              {detailConnection ? `Status note: ${detailConnection.note}` : "Awaiting details..."}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Guided setup</CardTitle>
            <CardDescription>Follow these steps to confirm a clean connection.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {steps.map((step) => (
              <div
                key={step.label}
                className="rounded-xl border border-zinc-200 bg-zinc-50 p-4 dark:border-zinc-800 dark:bg-zinc-900"
              >
                <p className="flex items-center gap-2 text-base font-medium text-zinc-900 dark:text-zinc-100">
                  {step.ok ? (
                    <CheckCircle2 className="size-4 text-emerald-500" />
                  ) : (
                    <CircleAlert className="size-4 text-amber-500" />
                  )}
                  {step.label}
                </p>
                <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">{step.detail}</p>
              </div>
            ))}

            <div className="rounded-xl border border-[var(--color-accent-border)] bg-[var(--color-accent-muted)] p-4 text-sm text-[var(--color-accent-foreground)]">
              <p className="flex items-center gap-2 font-medium">
                <ShieldCheck className="size-4 text-[var(--color-accent-primary)]" />
                Friendly health hint
              </p>
              <p className="mt-1">If auth and health are green, this connection is ready to use.</p>
            </div>

            <div className="rounded-xl border border-zinc-200 bg-white p-4 text-sm text-zinc-700 dark:border-zinc-800 dark:bg-zinc-950 dark:text-zinc-300">
              <p className="flex items-center gap-2 font-medium">
                <BadgeCheck className="size-4 text-zinc-500" />
                Status language guide
              </p>
              <ul className="mt-2 list-disc space-y-1 pl-5">
                <li>Healthy = ready now.</li>
                <li>Needs attention = usually sign-in or quality check.</li>
                <li>Offline = currently unavailable.</li>
              </ul>
            </div>

            <div className="rounded-xl border border-zinc-200 bg-white p-4 text-sm text-zinc-700 dark:border-zinc-800 dark:bg-zinc-950 dark:text-zinc-300">
              <p className="font-medium">OpenClaw compatibility snapshot</p>
              <ul className="mt-2 space-y-1">
                <li>
                  <span className="text-zinc-500 dark:text-zinc-400">UI mode:</span> {compat.uiMode}
                </li>
                <li>
                  <span className="text-zinc-500 dark:text-zinc-400">Gateway:</span> {compat.gatewayUrl}
                </li>
                <li>
                  <span className="text-zinc-500 dark:text-zinc-400">API base:</span> {resolveApiBaseUrl(compat)}
                </li>
                <li>
                  <span className="text-zinc-500 dark:text-zinc-400">Auth mode:</span> {compat.authMode}
                </li>
              </ul>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
