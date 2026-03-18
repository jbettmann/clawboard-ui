"use client";

import { useEffect, useMemo, useState } from "react";
import { CheckCircle2, Circle } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { PageHeader } from "@/components/page-header";
import { EmptyState, ErrorState, LoadingState } from "@/components/ui/async-states";
import { fetchSkills, Skill, SkillStatus } from "@/lib/openclaw-client";
import { useOpenClawResource } from "@/hooks/use-openclaw-resource";

function statusBadge(status: SkillStatus) {
  if (status === "ready") return <Badge className="bg-[var(--color-state-good)] text-[var(--color-surface-card)]">Ready</Badge>;
  if (status === "needs-review") {
    return <Badge className="bg-[var(--color-state-watch)] text-[var(--color-surface-card)]">Needs review</Badge>;
  }
  return <Badge variant="muted">Draft</Badge>;
}

export function SkillsManagement() {
  const { status, data, error, refresh } = useOpenClawResource<Skill[]>(fetchSkills, []);
  const [selectedId, setSelectedId] = useState<string | null>(null);

  const skills = useMemo(() => data ?? [], [data]);

  useEffect(() => {
    if (status !== "success" || !skills.length) {
      return;
    }

    const timer = setTimeout(() => {
      setSelectedId((prev) => (prev && skills.some((skill) => skill.id === prev) ? prev : skills[0].id));
    }, 0);

    return () => {
      clearTimeout(timer);
    };
  }, [status, skills]);

  const selectedSkill = useMemo(() => {
    if (!skills.length) return null;
    return skills.find((skill) => skill.id === selectedId) ?? skills[0];
  }, [skills, selectedId]);

  const header = (
    <PageHeader
      title="Skills management"
      context="Review OpenClaw skills in a read-only snapshot."
      supportingStatus={
        <>
          <Badge variant="muted">{skills.length} skill{skills.length === 1 ? "" : "s"}</Badge>
          {selectedSkill ? statusBadge(selectedSkill.status) : <Badge variant="muted">{status === "loading" ? "Refreshing" : "No selection"}</Badge>}
          <Badge variant="muted">Read-only view</Badge>
        </>
      }
      primaryAction={
        <Button size="lg" variant="secondary" onClick={refresh}>
          Refresh
        </Button>
      }
    />
  );

  if (status === "loading") {
    return (
      <div className="space-y-5 pb-6">
        {header}
        <LoadingState title="Loading skills" description="Pulling live data from OpenClaw…" />
      </div>
    );
  }

  if (status === "error") {
    return (
      <div className="space-y-5 pb-6">
        {header}
        <ErrorState
          title="Unable to load skills"
          description={error ?? "Check compatibility settings and try again."}
          action={
            <Button variant="ghost" onClick={refresh}>
              Retry
            </Button>
          }
        />
      </div>
    );
  }

  if (!skills.length) {
    return (
      <div className="space-y-5 pb-6">
        {header}
        <EmptyState
          title="No skills available"
          description="No skill inventory was returned from OpenClaw."
          action={
            <Button variant="ghost" onClick={refresh}>
              Refresh
            </Button>
          }
        />
      </div>
    );
  }

  return (
    <div className="space-y-5 pb-6">
      {header}

      <div className="grid gap-5 lg:grid-cols-[320px_1fr]">
        <Card>
          <CardHeader>
            <CardTitle>Skills list</CardTitle>
            <CardDescription>Choose a skill to view its behavior and governance metadata.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="space-y-2">
              {skills.map((skill) => (
                <button
                  key={skill.id}
                  type="button"
                  onClick={() => setSelectedId(skill.id)}
                  aria-pressed={selectedId === skill.id}
                  aria-label={`View skill ${skill.name}`}
                  className={`w-full rounded-xl border p-3 text-left transition-colors ${
                    selectedId === skill.id
                      ? "border-zinc-900 bg-zinc-900 text-zinc-50 dark:border-zinc-100 dark:bg-zinc-100 dark:text-zinc-900"
                      : "border-zinc-200 bg-zinc-50 hover:bg-zinc-100 dark:border-zinc-800 dark:bg-zinc-900 dark:hover:bg-zinc-800"
                  }`}
                >
                  <div className="flex items-center justify-between gap-2">
                    <p className="text-sm font-semibold">{skill.name}</p>
                    {skill.enabled ? <CheckCircle2 className="size-4" /> : <Circle className="size-4 opacity-70" />}
                  </div>
                  <p className="mt-1 text-sm opacity-85">{skill.summary}</p>
                  <div className="mt-2 flex items-center justify-between">
                    <span className="text-xs opacity-75">{skill.lastEdited}</span>
                    <span className="text-xs">{statusBadge(skill.status)}</span>
                  </div>
                </button>
              ))}
            </div>
          </CardContent>
        </Card>

        {selectedSkill ? (
          <Card>
            <CardHeader>
              <CardTitle>Skill details</CardTitle>
              <CardDescription>Static metadata, triggers, and governance notes.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
                <div className="rounded-xl border border-zinc-200/80 bg-zinc-50 p-4 dark:border-zinc-800/80 dark:bg-zinc-900">
                  <p className="text-xs text-zinc-500 dark:text-zinc-400">Skill name</p>
                  <p className="mt-1 text-lg font-semibold text-zinc-900 dark:text-zinc-100">{selectedSkill.name}</p>
                </div>
                <div className="rounded-xl border border-zinc-200/80 bg-zinc-50 p-4 dark:border-zinc-800/80 dark:bg-zinc-900">
                  <p className="text-xs text-zinc-500 dark:text-zinc-400">Safety level</p>
                  <p className="mt-1 text-lg font-semibold text-zinc-900 dark:text-zinc-100">{selectedSkill.safetyLevel ?? "Unknown"}</p>
                </div>
              </div>

              <div className="rounded-xl border border-zinc-200/80 bg-white p-4 text-sm text-zinc-700 dark:border-zinc-800 dark:bg-zinc-950 dark:text-zinc-300">
                <p className="text-xs text-zinc-500 dark:text-zinc-400">Summary</p>
                <p className="mt-1 text-base leading-7 text-zinc-900 dark:text-zinc-100">{selectedSkill.summary}</p>
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <div className="rounded-xl border border-zinc-200/80 bg-white p-4 text-sm text-zinc-700 dark:border-zinc-800 dark:bg-zinc-950 dark:text-zinc-300">
                  <p className="text-xs text-zinc-500 dark:text-zinc-400">Trigger hint</p>
                  <p className="mt-1 text-base text-zinc-900 dark:text-zinc-100">{selectedSkill.triggerHint ?? "—"}</p>
                </div>
                <div className="rounded-xl border border-zinc-200/80 bg-white p-4 text-sm text-zinc-700 dark:border-zinc-800 dark:bg-zinc-950 dark:text-zinc-300">
                  <p className="text-xs text-zinc-500 dark:text-zinc-400">Tags</p>
                  <p className="mt-1 text-base text-zinc-900 dark:text-zinc-100">{selectedSkill.tags || "None"}</p>
                </div>
              </div>

              <div className="flex flex-wrap items-center gap-2">
                {selectedSkill.enabled ? (
                  <Badge className="bg-[var(--color-state-good)] text-[var(--color-surface-card)]">Enabled</Badge>
                ) : (
                  <Badge variant="muted">Disabled</Badge>
                )}
                <Badge variant="muted">Last edited {selectedSkill.lastEdited}</Badge>
              </div>
            </CardContent>
          </Card>
        ) : null}
      </div>
    </div>
  );
}
