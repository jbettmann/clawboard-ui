"use client";

import Link from "next/link";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { EmptyState, ErrorState, LoadingState } from "@/components/ui/async-states";
import { PageHeader } from "@/components/page-header";
import { PatternCard } from "@/components/ui/pattern-card";
import { ScopeBadge } from "@/components/settings-scope-badge";
import {
  OPENCLAW_COMPAT_ASSUMPTIONS,
  getOpenClawCompatibilityConfig,
  resolveApiBaseUrl,
} from "@/lib/openclaw-compat";
import { fetchConnectionHealth } from "@/lib/openclaw-client";
import { useOpenClawResource } from "@/hooks/use-openclaw-resource";
import { useClawboardState, type UserSettingKey, type WorkspaceSettingKey } from "@/lib/clawboard-state";
import { scopeMetadata, type ConfigScope } from "@/lib/settings-scopes";
import type { OpenClawConnectionHealth, OpenClawHealthCheck } from "@/lib/openclaw-domains";

function healthBadge(status?: OpenClawHealthCheck["status"]) {
  if (status === "healthy") return <Badge className="bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-200">Healthy</Badge>;
  if (status === "degraded") return <Badge className="bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-300">Degraded</Badge>;
  if (status === "offline") return <Badge className="bg-zinc-200 text-zinc-800 dark:bg-zinc-800 dark:text-zinc-200">Offline</Badge>;
  return <Badge variant="muted">Unknown</Badge>;
}

function formatDateTime(value?: string) {
  if (!value) return "—";
  const parsed = Date.parse(value);
  if (Number.isNaN(parsed)) return value;
  return new Intl.DateTimeFormat(undefined, {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(parsed);
}

function HealthRow({ title, check }: { title: string; check?: OpenClawHealthCheck }) {
  return (
    <div className="rounded-2xl border border-[var(--color-border-default)] bg-[var(--color-surface-muted)] px-4 py-3">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <span className="text-sm font-semibold text-[var(--color-text-strong)]">{title}</span>
        {healthBadge(check?.status)}
      </div>
      <p className="mt-1 text-sm text-[var(--color-text-muted)]">{check?.details ?? "No details reported."}</p>
      <div className="mt-2 text-xs text-[var(--color-text-muted)]">
        <span>Last checked: {formatDateTime(check?.lastCheckedAt)}</span>
        {typeof check?.latencyMs === "number" ? <span> · {check.latencyMs} ms</span> : null}
      </div>
    </div>
  );
}

type SettingDefinition<Key extends string> = {
  key: Key;
  label: string;
  helper: string;
  impact: string;
  activeLabel: string;
  inactiveLabel: string;
};

type ScopeSettingsSectionProps<Key extends string> = {
  scope: ConfigScope;
  title: string;
  description: string;
  definitions: SettingDefinition<Key>[];
  values: Record<Key, boolean>;
  onToggle: (key: Key) => void;
};

function ScopeSettingsSection<Key extends string>({
  scope,
  title,
  description,
  definitions,
  values,
  onToggle,
}: ScopeSettingsSectionProps<Key>) {
  return (
    <PatternCard role="settings">
      <CardHeader>
        <CardTitle>{title}</CardTitle>
        <CardDescription className="text-base text-[var(--color-text-muted)] flex flex-wrap items-center gap-2">
          {description}
          <ScopeBadge scope={scope} />
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-3">
        {definitions.map((definition) => (
          <div key={definition.key} className="rounded-2xl border border-[var(--color-border-default)] bg-[var(--color-surface-muted)] p-3">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div className="space-y-1">
                <p className="text-sm font-semibold text-[var(--color-text-strong)]">{definition.label}</p>
                <p className="text-xs text-[var(--color-text-muted)]">{definition.helper}</p>
                <p className="text-[0.65rem] uppercase tracking-[0.3em] text-[var(--color-text-muted)]">
                  Impact: {definition.impact}
                </p>
              </div>
              <Button
                type="button"
                variant="secondary"
                size="sm"
                className="h-9 min-w-[5rem]"
                aria-pressed={values[definition.key]}
                onClick={() => onToggle(definition.key)}
              >
                {values[definition.key] ? definition.activeLabel : definition.inactiveLabel}
              </Button>
            </div>
          </div>
        ))}
      </CardContent>
    </PatternCard>
  );
}

const userSettingDefinitions: SettingDefinition<UserSettingKey>[] = [
  {
    key: "dailyDigest",
    label: "Daily OpenClaw digest",
    helper: "Receive a concise summary of today's signals and automations in your inbox each morning.",
    impact: "Applies to your user account across every workspace you sign into.",
    activeLabel: "Enabled",
    inactiveLabel: "Disabled",
  },
  {
    key: "highlightSignals",
    label: "Highlight starred signals",
    helper: "Pin your starred signals to the top of your focus feed and notifications.",
    impact: "Persists across every home view whenever you are signed in.",
    activeLabel: "Enabled",
    inactiveLabel: "Disabled",
  },
];

const workspaceSettingDefinitions: SettingDefinition<WorkspaceSettingKey>[] = [
  {
    key: "autoRefresh",
    label: "Auto-refresh workspace data",
    helper: "Keep runtime health and signals synced without manual reloads.",
    impact: "Applies to all pages and teammates within this workspace.",
    activeLabel: "On",
    inactiveLabel: "Off",
  },
  {
    key: "shareWorkspaceSignals",
    label: "Broadcast workspace alerts",
    helper: "Surface watch/risk signals across the workspace banner for your team.",
    impact: "Notifies everyone that shares this workspace when a signal escalates.",
    activeLabel: "Sharing",
    inactiveLabel: "Private",
  },
];

export default function SettingsPage() {
  const config = getOpenClawCompatibilityConfig();
  const resolvedApi = resolveApiBaseUrl(config);

  const { userSettings, workspaceSettings, toggleUserSetting, toggleWorkspaceSetting } = useClawboardState();

  const {
    status: healthStatus,
    data: health,
    error: healthError,
    refresh: refreshHealth,
  } = useOpenClawResource<OpenClawConnectionHealth>(fetchConnectionHealth, []);

  type DetailRow = { title: string; value: string; detail?: string };

  const detailRows: DetailRow[] = [
    { title: "Gateway URL", value: config.gatewayUrl },
    { title: "API base", value: config.apiBaseUrl, detail: `Resolved: ${resolvedApi}` },
    { title: "Stock UI", value: config.stockUiUrl },
  ];

  const nodeCount = health?.nodes?.length ?? 0;
  const servicesCount = health?.services ? Object.keys(health.services).length : 0;

  return (
    <div className="page-shell" data-density-mode="settings">
      <PageHeader
        title="Settings"
        context="Scope-aware configuration for your user and workspace preferences before runtime health and compatibility details."
        supportingStatus={
          <>
            <Badge variant="muted">{config.uiMode} mode</Badge>
            <Badge variant="muted">{config.authMode} auth</Badge>
            <Badge variant="muted">
              {healthStatus === "success"
                ? "Live runtime"
                : healthStatus === "loading"
                  ? "Refreshing runtime"
                  : healthStatus === "error"
                    ? "Runtime unavailable"
                    : "Runtime idle"}
            </Badge>
          </>
        }
        primaryAction={
          <div className="flex items-center gap-2">
            <Button size="lg" variant="secondary" onClick={refreshHealth}>
              Refresh runtime
            </Button>
            <Button asChild size="lg" variant="secondary">
              <Link href="/settings/advanced">View status & history</Link>
            </Button>
          </div>
        }
      />

      <div className="space-y-5">
        <div className="grid gap-5 lg:grid-cols-2">
          <ScopeSettingsSection
            scope="user"
            title="User preferences"
            description={scopeMetadata.user.description}
            definitions={userSettingDefinitions}
            values={userSettings}
            onToggle={toggleUserSetting}
          />
          <ScopeSettingsSection
            scope="workspace"
            title="Workspace preferences"
            description={scopeMetadata.workspace.description}
            definitions={workspaceSettingDefinitions}
            values={workspaceSettings}
            onToggle={toggleWorkspaceSetting}
          />
        </div>

        <PatternCard role="alert">
          <CardHeader>
            <CardTitle>Runtime health snapshot</CardTitle>
            <CardDescription className="text-[var(--color-text-muted)]">
              Live gateway/auth/node/service health from OpenClaw.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {healthStatus === "loading" ? (
              <LoadingState title="Loading runtime health" description="Fetching /status/health from OpenClaw…" />
            ) : healthStatus === "error" ? (
              <ErrorState
                title="Unable to load runtime health"
                description={healthError ?? "Check gateway connectivity and try again."}
                action={
                  <Button variant="ghost" onClick={refreshHealth}>
                    Retry
                  </Button>
                }
              />
            ) : !health ? (
              <EmptyState
                title="No runtime health available"
                description="OpenClaw has not returned status health data yet."
                action={
                  <Button variant="ghost" onClick={refreshHealth}>
                    Refresh
                  </Button>
                }
              />
            ) : (
              <>
                <HealthRow title="Gateway" check={health.gateway} />
                <HealthRow title="Authentication" check={health.auth} />
                {health.nodes?.map((node, index) => (
                  <HealthRow key={`${node.component}-${index}`} title={`Node · ${node.component}`} check={node} />
                ))}
                {Object.entries(health.services ?? {}).map(([name, check]) => (
                  <HealthRow key={name} title={`Service · ${name}`} check={check} />
                ))}
                <p className="text-xs text-[var(--color-text-muted)]">
                  Coverage: {nodeCount} node{nodeCount === 1 ? "" : "s"}, {servicesCount} service{servicesCount === 1 ? "" : "s"}.
                </p>
              </>
            )}
          </CardContent>
        </PatternCard>

        <div className="grid gap-5 lg:grid-cols-[1.1fr_0.9fr]">
          <PatternCard role="list">
            <CardHeader>
              <CardTitle>Compatibility snapshot</CardTitle>
              <CardDescription className="text-[var(--color-text-muted)]">
                Environment values that keep Clawboard aligned with OpenClaw.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {detailRows.map((row) => (
                <div key={row.title} className="space-y-1 rounded-2xl border border-[var(--color-border-default)] bg-[var(--color-surface-muted)] px-4 py-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-semibold text-[var(--color-text-strong)]">{row.title}</span>
                    <span className="text-sm text-[var(--color-text-muted)]">{row.value}</span>
                  </div>
                  {row.detail ? <p className="text-xs text-[var(--color-text-muted)]">{row.detail}</p> : null}
                </div>
              ))}
            </CardContent>
          </PatternCard>

          <PatternCard role="list">
            <CardHeader>
              <CardTitle>Compatibility assumptions</CardTitle>
              <CardDescription className="text-[var(--color-text-muted)]">
                What this UI relies on when acting as a drop-in companion.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              {OPENCLAW_COMPAT_ASSUMPTIONS.map((item) => (
                <p
                  key={item}
                  className="rounded-xl border border-[var(--color-border-default)] bg-[var(--color-surface-card)] px-4 py-3 text-sm text-[var(--color-text-muted)]"
                >
                  {item}
                </p>
              ))}
            </CardContent>
          </PatternCard>
        </div>
      </div>
    </div>
  );
}
