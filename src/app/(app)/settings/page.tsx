import Link from "next/link";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { PageHeader } from "@/components/page-header";
import {
  OPENCLAW_COMPAT_ASSUMPTIONS,
  getOpenClawCompatibilityConfig,
  resolveApiBaseUrl,
} from "@/lib/openclaw-compat";

export default function SettingsPage() {
  const config = getOpenClawCompatibilityConfig();
  const resolvedApi = resolveApiBaseUrl(config);

  type DetailRow = { title: string; value: string; detail?: string };

  const detailRows: DetailRow[] = [
    { title: "Gateway URL", value: config.gatewayUrl },
    { title: "API base", value: config.apiBaseUrl, detail: `Resolved: ${resolvedApi}` },
    { title: "Stock UI", value: config.stockUiUrl },
  ];

  return (
    <div className="space-y-5 pb-6">
      <PageHeader
        title="Settings"
        context="Comfort defaults, visibility, and deployment-ready compatibility details."
        supportingStatus={
          <>
            <Badge variant="muted">{config.uiMode} mode</Badge>
            <Badge variant="muted">{config.authMode} auth</Badge>
          </>
        }
        primaryAction={
          <Button asChild size="lg" variant="secondary">
            <Link href="/settings/advanced">View status & history</Link>
          </Button>
        }
      />

      <div className="grid gap-5 lg:grid-cols-[1.1fr_0.9fr]">
        <Card>
          <CardHeader>
            <CardTitle>Compatibility snapshot</CardTitle>
            <CardDescription>Environment values that keep Clawboard aligned with OpenClaw.</CardDescription>
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
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Compatibility assumptions</CardTitle>
            <CardDescription>What this UI relies on when acting as a drop-in companion.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {OPENCLAW_COMPAT_ASSUMPTIONS.map((item) => (
              <p
                key={item}
                className="rounded-xl border border-zinc-200 bg-zinc-50 px-4 py-3 text-sm text-[var(--color-text-muted)] dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-300"
              >
                {item}
              </p>
            ))}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
