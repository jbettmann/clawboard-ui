"use client";

import { useMemo, useState } from "react";
import { BadgeCheck, Cable, CheckCircle2, CircleAlert, HeartPulse, KeyRound, Link2, ShieldCheck, Wifi } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { getOpenClawCompatibilityConfig, resolveApiBaseUrl } from "@/lib/openclaw-compat";

type ConnectionHealth = "healthy" | "attention" | "offline";
type AuthState = "connected" | "needs-auth" | "not-connected";

type ConnectionItem = {
  id: string;
  name: string;
  target: string;
  type: string;
  health: ConnectionHealth;
  auth: AuthState;
  latency: string;
  lastChecked: string;
  note: string;
};

const initialConnections: ConnectionItem[] = [
  {
    id: "gateway-home",
    name: "Home gateway",
    target: "Primary OpenClaw gateway",
    type: "Core",
    health: "healthy",
    auth: "connected",
    latency: "42 ms",
    lastChecked: "1 min ago",
    note: "Ready for local and remote tasks.",
  },
  {
    id: "android-node",
    name: "Android companion",
    target: "Pixel device",
    type: "Device",
    health: "attention",
    auth: "needs-auth",
    latency: "—",
    lastChecked: "9 min ago",
    note: "Pairing expired. Re-auth is needed.",
  },
  {
    id: "browser-relay",
    name: "Browser relay",
    target: "Chrome relay profile",
    type: "Browser",
    health: "offline",
    auth: "not-connected",
    latency: "—",
    lastChecked: "15 min ago",
    note: "Relay is off until toolbar attach is approved.",
  },
];

function healthBadge(health: ConnectionHealth) {
  if (health === "healthy") return <Badge className="bg-[var(--color-state-good)] text-[var(--color-surface-card)]">Healthy</Badge>;
  if (health === "attention") return <Badge className="bg-[var(--color-state-watch)] text-[var(--color-surface-card)]">Needs attention</Badge>;
  return <Badge variant="muted">Offline</Badge>;
}

function authLabel(state: AuthState) {
  if (state === "connected") return "Signed in";
  if (state === "needs-auth") return "Re-auth required";
  return "Not connected";
}

export function ConnectionsManagement() {
  const [connections, setConnections] = useState<ConnectionItem[]>(initialConnections);
  const [selectedId, setSelectedId] = useState<string>(connections[0].id);
  const [statusNote, setStatusNote] = useState<string>("No recent action");

  const selected = connections.find((item) => item.id === selectedId) ?? connections[0];
  const compat = getOpenClawCompatibilityConfig();

  const summary = useMemo(() => {
    const healthy = connections.filter((item) => item.health === "healthy").length;
    const attention = connections.filter((item) => item.health === "attention").length;
    const offline = connections.filter((item) => item.health === "offline").length;
    return { healthy, attention, offline };
  }, [connections]);

  function connectNow() {
    setConnections((prev) =>
      prev.map((item) =>
        item.id === selected.id
          ? {
              ...item,
              health: "healthy",
              auth: "connected",
              latency: item.latency === "—" ? "58 ms" : item.latency,
              lastChecked: "Just now",
              note: "Connection restored and stable.",
            }
          : item,
      ),
    );
    setStatusNote(`${selected.name} connected`);
  }

  function startAuthFlow() {
    setConnections((prev) =>
      prev.map((item) =>
        item.id === selected.id
          ? {
              ...item,
              auth: "needs-auth",
              health: "attention",
              lastChecked: "Just now",
              note: "Authentication step opened. Complete sign-in to finish.",
            }
          : item,
      ),
    );
    setStatusNote(`Auth flow started for ${selected.name}`);
  }

  function runHealthCheck() {
    setConnections((prev) =>
      prev.map((item) =>
        item.id === selected.id
          ? {
              ...item,
              health: item.auth === "connected" ? "healthy" : "attention",
              latency: item.auth === "connected" ? "44 ms" : "—",
              lastChecked: "Just now",
            }
          : item,
      ),
    );
    setStatusNote(`Health check complete for ${selected.name}`);
  }

  const steps = [
    {
      label: "1) Check sign-in",
      detail: selected.auth === "connected" ? "Connected and valid." : "Sign-in required before connection can complete.",
      ok: selected.auth === "connected",
    },
    {
      label: "2) Verify connection",
      detail: selected.health === "healthy" ? "Connection quality is stable." : "Run health check after sign-in.",
      ok: selected.health === "healthy",
    },
    {
      label: "3) Confirm ready state",
      detail: selected.health === "healthy" && selected.auth === "connected" ? "This connection is ready to use." : "Finish steps above to mark ready.",
      ok: selected.health === "healthy" && selected.auth === "connected",
    },
  ];

  return (
    <div className="space-y-5 pb-6">
      <Card>
        <CardHeader>
          <Badge variant="muted">Phase 5 · Connections</Badge>
          <CardTitle className="mt-3 flex items-center gap-2 text-2xl">
            <Cable className="size-5 text-[var(--color-accent-primary)]" />
            Connections center
          </CardTitle>
          <CardDescription className="text-base">
            Guided connect and auth flow with plain-language health information.
          </CardDescription>
        </CardHeader>
      </Card>

      <div className="grid gap-5 lg:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <HeartPulse className="size-4 text-zinc-500" />
              Health at a glance
            </CardTitle>
            <CardDescription>Simple signal counts across all connections.</CardDescription>
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
            <CardDescription>Choose one connection to see guided setup and actions.</CardDescription>
          </CardHeader>
          <CardContent className="grid gap-3 md:grid-cols-2">
            {connections.map((item) => (
              <button
                key={item.id}
                type="button"
                onClick={() => setSelectedId(item.id)}
                aria-pressed={selected.id === item.id}
                aria-label={`Select connection ${item.name}`}
                className={`rounded-xl border p-4 text-left transition-colors ${
                  selected.id === item.id
                    ? "border-zinc-900 bg-zinc-900 text-zinc-50 dark:border-zinc-100 dark:bg-zinc-100 dark:text-zinc-900"
                    : "border-zinc-200 bg-zinc-50 hover:bg-zinc-100 dark:border-zinc-800 dark:bg-zinc-900 dark:hover:bg-zinc-800"
                }`}
              >
                <div className="flex items-center justify-between gap-2">
                  <p className="text-base font-semibold">{item.name}</p>
                  {healthBadge(item.health)}
                </div>
                <p className="mt-1 text-sm opacity-85">{item.target}</p>
                <p className="mt-2 text-xs opacity-80">{authLabel(item.auth)} · Last checked {item.lastChecked}</p>
              </button>
            ))}
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-5 xl:grid-cols-[1.15fr_1fr]">
        <Card>
          <CardHeader>
            <div className="flex flex-wrap items-center gap-2">
              {healthBadge(selected.health)}
              <Badge variant="muted">{selected.type}</Badge>
            </div>
            <CardTitle className="mt-3 text-2xl">{selected.name}</CardTitle>
            <CardDescription className="text-base">{selected.note}</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-3 md:grid-cols-3">
              <div className="rounded-xl border border-zinc-200 bg-zinc-50 p-3 dark:border-zinc-800 dark:bg-zinc-900">
                <p className="text-xs text-zinc-500">Auth status</p>
                <p className="mt-1 text-base font-medium text-zinc-900 dark:text-zinc-100">{authLabel(selected.auth)}</p>
              </div>
              <div className="rounded-xl border border-zinc-200 bg-zinc-50 p-3 dark:border-zinc-800 dark:bg-zinc-900">
                <p className="text-xs text-zinc-500">Latency</p>
                <p className="mt-1 text-base font-medium text-zinc-900 dark:text-zinc-100">{selected.latency}</p>
              </div>
              <div className="rounded-xl border border-zinc-200 bg-zinc-50 p-3 dark:border-zinc-800 dark:bg-zinc-900">
                <p className="text-xs text-zinc-500">Last checked</p>
                <p className="mt-1 text-base font-medium text-zinc-900 dark:text-zinc-100">{selected.lastChecked}</p>
              </div>
            </div>

            <div className="grid gap-3 sm:grid-cols-3">
              <Button className="h-11 text-base" onClick={connectNow}>
                <Link2 className="size-4" />
                Connect now
              </Button>
              <Button className="h-11 text-base" variant="secondary" onClick={startAuthFlow}>
                <KeyRound className="size-4" />
                Fix sign-in
              </Button>
              <Button className="h-11 text-base" variant="secondary" onClick={runHealthCheck}>
                <Wifi className="size-4" />
                Run health check
              </Button>
            </div>

            <p className="text-sm text-zinc-500 dark:text-zinc-400" aria-live="polite">
              {statusNote}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Guided setup</CardTitle>
            <CardDescription>Follow these three steps in order for a clean connect flow.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {steps.map((step) => (
              <div
                key={step.label}
                className="rounded-xl border border-zinc-200 bg-zinc-50 p-4 dark:border-zinc-800 dark:bg-zinc-900"
              >
                <p className="flex items-center gap-2 text-base font-medium text-zinc-900 dark:text-zinc-100">
                  {step.ok ? <CheckCircle2 className="size-4 text-emerald-500" /> : <CircleAlert className="size-4 text-amber-500" />}
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
              <p className="mt-1">If auth is valid and health is green, you can use this connection safely without extra setup.</p>
            </div>

            <div className="rounded-xl border border-zinc-200 bg-white p-4 text-sm text-zinc-700 dark:border-zinc-800 dark:bg-zinc-950 dark:text-zinc-300">
              <p className="flex items-center gap-2 font-medium">
                <BadgeCheck className="size-4 text-zinc-500" />
                Status language guide
              </p>
              <ul className="mt-2 list-disc space-y-1 pl-5">
                <li>Healthy = ready now.</li>
                <li>Needs attention = usually sign-in or quality check.</li>
                <li>Offline = currently unavailable, reconnect when needed.</li>
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
