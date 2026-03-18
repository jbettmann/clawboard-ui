"use client";

import type { LucideIcon } from "lucide-react";
import { Bookmark, BookmarkCheck, MessageCircle, Pin, PinOff, ShieldCheck, Sparkles, Wrench } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { EmptyState, ErrorState, LoadingState } from "@/components/ui/async-states";
import { PageHeader } from "@/components/page-header";
import { fetchDailyBriefs, type DailyBrief, type OutputKind } from "@/lib/openclaw-client";
import { useClawboardState } from "@/lib/clawboard-state";
import { useOpenClawResource } from "@/hooks/use-openclaw-resource";

const KIND_METADATA: Record<OutputKind, { label: string; icon: LucideIcon }> = {
  "daily-brief": { label: "Daily brief", icon: Sparkles },
  job: { label: "Job output", icon: Wrench },
  chat: { label: "Chat output", icon: MessageCircle },
  system: { label: "System notice", icon: ShieldCheck },
  manual: { label: "Manual note", icon: Bookmark },
};

function renderKindBadge(kind: OutputKind) {
  const meta = KIND_METADATA[kind];
  return (
    <Badge className="flex items-center gap-1">
      <meta.icon className="size-3" />
      {meta.label}
    </Badge>
  );
}

function formatBriefDate(value?: string) {
  if (!value) return "—";
  const parsed = Date.parse(value);
  if (Number.isNaN(parsed)) return value;
  return new Intl.DateTimeFormat(undefined, { dateStyle: "medium" }).format(parsed);
}

export function OutputsManagement() {
  const {
    outputs,
    selectedOutputId,
    setSelectedOutputId,
    toggleOutputPinned,
    toggleOutputSaved,
  } = useClawboardState();

  const {
    status: briefsStatus,
    data: briefsData,
    error: briefsError,
    refresh: refreshBriefs,
  } = useOpenClawResource<DailyBrief[]>(fetchDailyBriefs, []);

  const dailyBriefs = briefsData ?? [];
  const latestBrief = dailyBriefs[0];

  const selectedOutput = outputs.find((item) => item.id === selectedOutputId) ?? outputs[0];

  if (!selectedOutput) {
    return (
      <div className="space-y-5 pb-6">
        <PageHeader
          title="Outputs center"
          context="Review finished briefs, pin the useful ones, and keep clean detail views."
          supportingStatus={<Badge variant="muted">Waiting for live outputs</Badge>}
          primaryAction={
            <Button size="lg" variant="secondary" disabled>
              Waiting for outputs
            </Button>
          }
        />
        <Card>
          <CardHeader>
            <CardTitle>Outputs are loading</CardTitle>
            <CardDescription>Connect to OpenClaw to see live briefs and digests.</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-zinc-600 dark:text-zinc-400">
              No outputs are available right now. Refresh the page once the gateway is reachable.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-5 pb-6">
      <PageHeader
        title="Outputs center"
        context="Review finished briefs, pin the useful ones, and keep clean detail views."
        supportingStatus={
          <>
            <Badge variant="muted">{selectedOutput.source}</Badge>
            {renderKindBadge(selectedOutput.kind)}
            {selectedOutput.pinned ? <Badge>Pinned</Badge> : null}
            {selectedOutput.saved ? <Badge variant="muted">Saved</Badge> : null}
          </>
        }
        primaryAction={
          <Button onClick={() => toggleOutputPinned(selectedOutput.id)} size="lg">
            {selectedOutput.pinned ? <PinOff className="size-4" /> : <Pin className="size-4" />}
            {selectedOutput.pinned ? "Unpin from Home" : "Pin to Home"}
          </Button>
        }
      />

      <div className="grid gap-5 lg:grid-cols-[340px_1fr]">
        <Card>
          <CardHeader>
            <CardTitle>Output feed</CardTitle>
            <CardDescription>Most recent and high-value outputs in one calm list.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {outputs.map((output) => (
              <button
                key={output.id}
                type="button"
                onClick={() => setSelectedOutputId(output.id)}
                aria-pressed={selectedOutput.id === output.id}
                aria-label={`Open output ${output.title}`}
                className={`w-full rounded-xl border p-4 text-left transition-colors ${
                  selectedOutput.id === output.id
                    ? "border-zinc-900 bg-zinc-900 text-zinc-50 dark:border-zinc-100 dark:bg-zinc-100 dark:text-zinc-900"
                    : "border-zinc-200 bg-zinc-50 hover:bg-zinc-100 dark:border-zinc-800 dark:bg-zinc-900 dark:hover:bg-zinc-800"
                }`}
              >
                <div className="flex items-start justify-between gap-2">
                <p className="text-base font-semibold">{output.title}</p>
                <span className="text-xs opacity-80">{output.updatedAt}</span>
              </div>
                <p className="mt-1 text-sm opacity-85">{output.summary ?? "No summary available."}</p>
                <div className="mt-3 flex flex-wrap items-center gap-2">
                  {renderKindBadge(output.kind)}
                  {output.pinned ? <Badge>Pinned</Badge> : null}
                  {output.saved ? <Badge variant="muted">Saved</Badge> : null}
                </div>
              </button>
            ))}
          </CardContent>
        </Card>

        <Card>
        <CardHeader>
          <div className="flex flex-wrap items-center gap-2">
            <Badge variant="muted">Detail view</Badge>
            <Badge className="bg-zinc-100 text-zinc-700 dark:bg-zinc-800 dark:text-zinc-200">{selectedOutput.source}</Badge>
          </div>
          <CardTitle className="mt-3 text-2xl">{selectedOutput.title}</CardTitle>
          <CardDescription className="text-base">Updated {selectedOutput.updatedAt}</CardDescription>
          <p className="text-xs text-zinc-500 dark:text-zinc-400">Created {selectedOutput.createdAt ?? "—"}</p>
        </CardHeader>
          <CardContent className="space-y-4">
            <div className="rounded-xl border border-zinc-200 bg-zinc-50 p-4 dark:border-zinc-800 dark:bg-zinc-900">
              <p className="text-sm leading-7 text-zinc-700 dark:text-zinc-300">{selectedOutput.body}</p>
            </div>

            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              <Button
                onClick={() => toggleOutputPinned(selectedOutput.id)}
                variant={selectedOutput.pinned ? "default" : "secondary"}
                className="h-11 text-base"
              >
                {selectedOutput.pinned ? <PinOff className="size-4" /> : <Pin className="size-4" />}
                {selectedOutput.pinned ? "Unpin from Home" : "Pin to Home"}
              </Button>

              <Button
                onClick={() => toggleOutputSaved(selectedOutput.id)}
                variant={selectedOutput.saved ? "default" : "secondary"}
                className="h-11 text-base"
              >
                {selectedOutput.saved ? <BookmarkCheck className="size-4" /> : <Bookmark className="size-4" />}
                {selectedOutput.saved ? "Saved" : "Save output"}
              </Button>

              <div className="flex items-center gap-2 rounded-xl border border-[var(--color-accent-border)] bg-[var(--color-accent-muted)] px-3 py-2 text-sm text-[var(--color-accent-foreground)]">
                <Sparkles className="size-4 text-[var(--color-accent-primary)]" />
                Pinning makes this item appear on Home automatically.
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-5 lg:grid-cols-2">
        <Card>
          <CardHeader className="flex flex-col gap-2">
            <div className="flex items-center justify-between gap-3">
              <div className="flex items-center gap-2">
                <Sparkles className="size-4 text-zinc-500" />
                <CardTitle className="m-0">Daily briefs</CardTitle>
              </div>
              <Button variant="ghost" size="sm" onClick={refreshBriefs}>
                Refresh briefs
              </Button>
            </div>
            <CardDescription>OpenClaw daily context summaries.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {briefsStatus === "loading" ? (
              <LoadingState title="Loading briefs" description="Fetching the latest digest." />
            ) : briefsStatus === "error" ? (
              <ErrorState
                title="Unable to load briefs"
                description={briefsError ?? "Try refreshing this list."}
                action={
                  <Button variant="ghost" onClick={refreshBriefs}>
                    Retry
                  </Button>
                }
              />
            ) : dailyBriefs.length ? (
              dailyBriefs.slice(0, 3).map((brief) => (
                <article
                  key={brief.id}
                  className="space-y-1 rounded-xl border border-zinc-200 bg-zinc-50 px-4 py-3 dark:border-zinc-800 dark:bg-zinc-900"
                >
                  <p className="text-xs text-zinc-500 dark:text-zinc-400">{formatBriefDate(brief.date)}</p>
                  <p className="text-base font-semibold text-zinc-900 dark:text-zinc-100">{brief.title}</p>
                  <p className="text-sm text-zinc-600 dark:text-zinc-400">{brief.summary}</p>
                  {brief.highlights.length ? (
                    <ul className="text-xs text-zinc-500 dark:text-zinc-400">
                      {brief.highlights.slice(0, 3).map((highlight) => (
                        <li key={highlight}>• {highlight}</li>
                      ))}
                    </ul>
                  ) : null}
                </article>
              ))
            ) : (
              <EmptyState
                title="No briefs yet"
                description="Daily briefs will appear once OpenClaw composes the next summary."
                action={
                  <Button variant="ghost" onClick={refreshBriefs}>
                    Refresh
                  </Button>
                }
              />
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Latest brief</CardTitle>
            <CardDescription>Highlights and related outputs for the most recent digest.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {briefsStatus === "loading" ? (
              <LoadingState title="Loading latest brief" description="Waiting for data from OpenClaw…" />
            ) : briefsStatus === "error" ? (
              <ErrorState
                title="Unable to load brief"
                description={briefsError ?? "Try refreshing the briefs view."}
                action={
                  <Button variant="ghost" onClick={refreshBriefs}>
                    Retry
                  </Button>
                }
              />
            ) : latestBrief ? (
              <div className="space-y-3">
                <div className="flex items-center justify-between gap-2">
                  <p className="text-xs text-zinc-500 dark:text-zinc-400">Published {formatBriefDate(latestBrief.date)}</p>
                  <Badge className="flex items-center gap-1">
                    <Sparkles className="size-3" />
                    Daily brief
                  </Badge>
                </div>
                <p className="text-lg font-semibold text-zinc-900 dark:text-zinc-100">{latestBrief.title}</p>
                <p className="text-sm text-zinc-700 dark:text-zinc-300">{latestBrief.summary}</p>
                {latestBrief.highlights.length ? (
                  <ul className="space-y-1 text-sm text-zinc-600 dark:text-zinc-400">
                    {latestBrief.highlights.map((highlight) => (
                      <li key={highlight}>• {highlight}</li>
                    ))}
                  </ul>
                ) : null}
                {latestBrief.outputs?.length ? (
                  <div className="rounded-xl border border-zinc-200 bg-white/60 px-3 py-2 text-xs text-zinc-600 dark:border-zinc-800 dark:bg-zinc-900/30 dark:text-zinc-300">
                    <p className="text-xs uppercase tracking-[0.3em] text-zinc-500 dark:text-zinc-400">Related outputs</p>
                    <ul className="mt-1 space-y-1">
                      {latestBrief.outputs.map((ref) => (
                        <li key={ref.id} className="flex items-center justify-between">
                          <span>{ref.title}</span>
                          <Badge className="text-xs">{ref.kind}</Badge>
                        </li>
                      ))}
                    </ul>
                  </div>
                ) : null}
              </div>
            ) : (
              <EmptyState
                title="No brief selected"
                description="Watch this space until OpenClaw composes the first daily brief."
                action={
                  <Button variant="ghost" onClick={refreshBriefs}>
                    Refresh
                  </Button>
                }
              />
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
