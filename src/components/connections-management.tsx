"use client";

import Link from "next/link";
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
import { InfoTile } from "@/components/ui/info-tile";
import { StatusBadge, StatusPanel, statusLabel, statusTextClass } from "@/components/ui/status";
import { mapConnectionHealthToStatus, type StatusVariant } from "@/lib/status-grammar";

function healthBadge(health: Connection["health"]) {
  const status = mapConnectionHealthToStatus(health);
  const label = health === "healthy" ? "Healthy" : health === "attention" ? "Needs attention" : "Offline";
  return (
    <StatusBadge
      status={status}
      label={label}
      showIcon={false}
      className="text-[0.6rem] uppercase tracking-[0.3em]"
    />
  );
}

function authLabel(state: Connection["auth"]) {
  if (state === "connected") return "Signed in";
  if (state === "needs-auth") return "Re-auth required";
  return "Not connected";
}

type FocusState = {
  status: StatusVariant;
  title: string;
  detail: string;
  helper: string;
  statusLabel: string;
  action?: { label: string; href: string };
};

type ConnectionStep = {
  label: string;
  detail: string;
  ok: boolean;
  action: string;
  actionHref?: string;
};

function describeFocusState(connection: Connection | null): FocusState | null {
  if (!connection) {
    return null;
  }

  if (connection.health === "offline") {
    return {
      title: "Offline and paused",
      detail:
        "This gateway is not reachable right now. Confirm the gateway network and restart the service if needed.",
      helper: "Bring the gateway back online before routing traffic through it.",
      status: "offline",
      statusLabel: "Offline",
      action: { label: "Open status & history", href: "/settings/advanced" },
    };
  }

  if (connection.auth !== "connected") {
    return {
      title: "Authentication needed",
      detail: "Credentials need refreshing so the gateway can resume handling traffic safely.",
      helper: "Refresh the credentials so requests can flow securely.",
      status: "risk",
      statusLabel: "Needs auth",
      action: { label: "Open settings", href: "/settings" },
    };
  }

  if (connection.health === "attention") {
    return {
      title: "Attention recommended",
      detail:
        "Gateway is online but flagged for review. Take a minute to check latency and connected devices before relying on it.",
      helper: "Review telemetry and revisit once health is calm.",
      status: "watch",
      statusLabel: "Attention recommended",
      action: { label: "Open status & history", href: "/settings/advanced" },
    };
  }

  return {
    title: "Ready to route traffic",
    detail: "Auth and health are green. Keep monitoring, and let this connection serve as expected.",
    helper: "This node is cleared for live use. Monitor if anything changes.",
    status: "healthy",
    statusLabel: "Ready",
  };
}

function actionLinkLabel(href: string) {
  if (href.includes("/settings/advanced")) {
    return "View status & history";
  }
  return "Open settings";
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

  const summaryTiles = (
    [
      { status: "healthy" as StatusVariant, label: "Healthy", value: summary.healthy },
      { status: "watch" as StatusVariant, label: "Needs attention", value: summary.attention },
      { status: "offline" as StatusVariant, label: "Offline", value: summary.offline },
    ]
  );

  const focusState = useMemo(() => describeFocusState(detailConnection), [detailConnection]);

  const header = (
    <PageHeader
      title="Connections center"
      context="Live gateway and device health with calm clarity and ready next steps."
      supportingStatus={
        <>
          {detailConnection ? (
            <>
              <Badge variant="muted">{detailConnection.type}</Badge>
              {healthBadge(detailConnection.health)}
              <Badge variant="muted">{authLabel(detailConnection.auth)}</Badge>
              <Badge variant="muted">Latency: {detailConnection.latency}</Badge>
            </>
          ) : (
            <>
              <Badge variant="muted">Device info pending</Badge>
              <Badge variant="muted">Health pending</Badge>
            </>
          )}
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
      <div className="page-shell" data-density-mode="operations">
        {header}
        <LoadingState title="Loading connections" description="Fetching live gateway health from OpenClaw…" />
      </div>
    );
  }

  if (status === "error") {
    return (
      <div className="page-shell" data-density-mode="operations">
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
      <div className="page-shell" data-density-mode="operations">
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

  const steps: ConnectionStep[] = [
    {
      label: "Sign-in health",
      detail: detailConnection
        ? detailConnection.auth === "connected"
          ? "Signed in and current."
          : "Authentication is paused; refresh credentials."
        : "Awaiting data.",
      ok: Boolean(detailConnection?.auth === "connected"),
      action: detailConnection
        ? detailConnection.auth === "connected"
          ? "Credentials are current."
          : "Open Settings to refresh the gateway authentication."
        : "Once the data arrives, this card will guide you.",
      actionHref: detailConnection && detailConnection.auth !== "connected" ? "/settings" : undefined,
    },
    {
      label: "Connection quality",
      detail: detailConnection
        ? detailConnection.health === "healthy"
          ? "Connection quality is stable."
          : detailConnection.health === "attention"
          ? "Gateway is online but marked for a closer look."
          : "This gateway is currently offline."
        : "Awaiting data.",
      ok: Boolean(detailConnection?.health === "healthy"),
      action: detailConnection
        ? detailConnection.health === "healthy"
          ? "Latency is steady."
          : detailConnection.health === "attention"
          ? "Review network and device health, then revisit."
          : "Confirm the gateway is reachable and restart if needed."
        : "Waiting on the connection snapshot.",
      actionHref: detailConnection && detailConnection.health !== "healthy" ? "/settings/advanced" : undefined,
    },
    {
      label: "Ready to serve",
      detail: detailConnection
        ? detailConnection.health === "healthy" && detailConnection.auth === "connected"
          ? "Connection is ready to handle requests."
          : "Resolve auth or health signals before relying on this node."
        : "Awaiting data.",
      ok: detailConnection ? detailConnection.health === "healthy" && detailConnection.auth === "connected" : false,
      action: detailConnection
        ? detailConnection.health === "healthy" && detailConnection.auth === "connected"
          ? "This node is cleared for live use."
          : "Follow the guidance above to restore readiness."
        : "Steps appear once data arrives.",
    },
  ];

  return (
    <div className="page-shell" data-density-mode="operations">
      {header}

      <div className="grid gap-5 lg:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <HeartPulse className="size-4 text-zinc-500" />
              Health at a glance
            </CardTitle>
            <CardDescription>Counts refresh live so you can focus on connections that need attention.</CardDescription>
          </CardHeader>
          <CardContent className="grid gap-3">
            {summaryTiles.map((item) => (
              <StatusPanel key={item.label} status={item.status} className="p-3">
                <p className={`text-xs font-semibold uppercase tracking-[0.3em] ${statusTextClass(item.status)}`}>
                  {item.label}
                </p>
                <p className="mt-1 text-2xl font-semibold text-[var(--color-text-strong)]">{item.value}</p>
              </StatusPanel>
            ))}
          </CardContent>
        </Card>

        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Connection list</CardTitle>
            <CardDescription>Choose a gateway to see live health, auth state, and calm next steps.</CardDescription>
          </CardHeader>
          <CardContent className="grid gap-3 md:grid-cols-2">
            {connections.map((item) => (
              <button
                key={item.id}
                type="button"
                onClick={() => setSelectedId(item.id)}
                aria-pressed={activeConnectionId === item.id}
                aria-label={`Select connection ${item.name}`}
                className={`density-row rounded-xl border text-left transition-colors ${
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
          <CardContent className="space-y-5">
            {focusState ? (
              <StatusPanel status={focusState.status} className="space-y-3 p-4">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-[0.3em] text-[var(--color-text-muted)]">
                      {statusLabel(focusState.status)}
                    </p>
                    <p className="mt-1 text-lg font-semibold text-[var(--color-text-strong)]">{focusState.title}</p>
                    <p className="text-sm text-[var(--color-text-muted)]">{focusState.detail}</p>
                  </div>
                  <StatusBadge
                    status={focusState.status}
                    label={focusState.statusLabel}
                    showIcon={false}
                    className="text-[0.6rem]"
                  />
                </div>
                <p className="text-sm text-[var(--color-text-muted)]">{focusState.helper}</p>
                {focusState.action ? (
                  <Button asChild size="sm" variant="ghost">
                    <Link href={focusState.action.href}>{focusState.action.label}</Link>
                  </Button>
                ) : null}
              </StatusPanel>
            ) : (
              <p className="rounded-2xl border border-dashed border-zinc-300 bg-zinc-50 px-4 py-3 text-sm text-zinc-600 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-300">
                Pick a connection to see a calm summary of its readiness.
              </p>
            )}

            <div className="grid gap-3 md:grid-cols-3">
              <InfoTile label="Auth status" value={detailConnection ? authLabel(detailConnection.auth) : "—"} />
              <InfoTile label="Latency" value={detailConnection?.latency ?? "—"} />
              <InfoTile label="Last checked" value={detailConnection?.lastChecked ?? "—"} />
            </div>

            <p className="text-sm text-[var(--color-text-soft)]" aria-live="polite">
              {detailConnection ? `Latest note: ${detailConnection.note}` : "Awaiting details..."}
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
                <p className="mt-2 text-xs text-zinc-500 dark:text-zinc-400">
                  {step.action}
                  {step.actionHref ? (
                    <>
                      {" "}
                      <Link href={step.actionHref} className="font-semibold text-[var(--color-accent-primary)]">
                        {actionLinkLabel(step.actionHref)}
                      </Link>
                    </>
                  ) : null}
                </p>
              </div>
            ))}

            <div className="rounded-xl border border-[var(--color-accent-border)] bg-[var(--color-accent-muted)] p-4 text-sm text-[var(--color-accent-foreground)]">
              <p className="flex items-center gap-2 font-medium">
                <ShieldCheck className="size-4 text-[var(--color-accent-primary)]" />
                Peaceful health reminder
              </p>
              <p className="mt-1">When auth and health stay green, you can rely on this gateway for steady work.</p>
            </div>

            <div className="rounded-xl border border-zinc-200 bg-white p-4 text-sm text-zinc-700 dark:border-zinc-800 dark:bg-zinc-950 dark:text-zinc-300">
              <p className="flex items-center gap-2 font-medium">
                <BadgeCheck className="size-4 text-zinc-500" />
                Tone key
              </p>
              <ul className="mt-2 list-disc space-y-1 pl-5">
                <li>Healthy = ready for now.</li>
                <li>Needs attention = re-check auth or review the connection quality.</li>
                <li>Offline = this node is unavailable until the gateway revives.</li>
              </ul>
            </div>

            <div className="rounded-xl border border-zinc-200 bg-white p-4 text-sm text-zinc-700 dark:border-zinc-800 dark:bg-zinc-950 dark:text-zinc-300">
              <p className="font-medium">Deployment context</p>
              <p className="text-xs text-zinc-500 dark:text-zinc-400">Where Clawboard is currently pointed.</p>
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
