"use client";

import { useEffect, useMemo, useState } from "react";
import { CheckCircle2, Circle } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { PageHeader } from "@/components/page-header";
import { EmptyState, ErrorState, LoadingState } from "@/components/ui/async-states";
import { cn } from "@/lib/utils";
import { fetchSkills, type Skill, type SkillOrigin, type SkillStatus } from "@/lib/openclaw-client";
import { useOpenClawResource } from "@/hooks/use-openclaw-resource";

const CATEGORY_DEFINITIONS = [
  {
    key: "builtin" as const,
    title: "Built-in library",
    description: "OpenClaw-managed automations that ship with the platform.",
    filter: (skill: Skill) => skill.origin === "builtin",
  },
  {
    key: "custom" as const,
    title: "Custom & partner skills",
    description: "Team-created or partner-delivered automations layered on top of the core.",
    filter: (skill: Skill) => !!skill.origin && skill.origin !== "builtin",
  },
  {
    key: "unknown" as const,
    title: "Unknown origin",
    description: "Skills missing origin metadata from OpenClaw.",
    filter: (skill: Skill) => !skill.origin,
  },
];

type SkillCategoryKey = (typeof CATEGORY_DEFINITIONS)[number]["key"];

type SkillCategory = {
  key: SkillCategoryKey;
  title: string;
  description: string;
  skills: Skill[];
};

function statusBadge(status: SkillStatus) {
  if (status === "ready") {
    return <Badge className="bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-200">Ready</Badge>;
  }
  if (status === "needs-review") {
    return <Badge className="bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-300">Needs review</Badge>;
  }
  if (status === "draft") {
    return <Badge className="bg-zinc-100 text-zinc-800 dark:bg-zinc-800 dark:text-zinc-200">Draft</Badge>;
  }
  if (status === "retired") {
    return <Badge className="bg-rose-100 text-rose-800 dark:bg-rose-900/30 dark:text-rose-200">Retired</Badge>;
  }
  return <Badge variant="muted">{status ?? "Unknown status"}</Badge>;
}

function originBadge(origin?: SkillOrigin) {
  if (origin === "builtin") {
    return <Badge className="bg-sky-100 text-sky-800 dark:bg-sky-900/30 dark:text-sky-300">Built-in</Badge>;
  }
  if (origin === "partner") {
    return <Badge className="bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300">Partner</Badge>;
  }
  if (origin === "custom") {
    return <Badge className="bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-300">Custom</Badge>;
  }
  if (origin) {
    return <Badge variant="muted">{origin}</Badge>;
  }
  return <Badge variant="muted">Origin unknown</Badge>;
}

function enabledBadge(enabled: boolean) {
  if (enabled) {
    return <Badge className="bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-200">Enabled</Badge>;
  }
  return <Badge className="bg-zinc-200 text-zinc-800 dark:bg-zinc-800 dark:text-zinc-200">Disabled</Badge>;
}

function getOriginDescription(origin?: SkillOrigin) {
  if (origin === "builtin") return "OpenClaw-maintained automation";
  if (origin === "partner") return "Partner or marketplace delivery";
  if (origin === "custom") return "Custom skill created for your workspace";
  if (origin) return origin;
  return "Origin metadata missing";
}

function formatDateTime(value?: string) {
  if (!value) return "—";
  const parsed = Date.parse(value);
  if (Number.isNaN(parsed)) {
    return value;
  }
  return new Intl.DateTimeFormat(undefined, {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(parsed);
}

function formatMetadataValue(value: unknown) {
  if (value === null || value === undefined) return "—";
  if (typeof value === "string" || typeof value === "number" || typeof value === "boolean") {
    return String(value);
  }
  if (Array.isArray(value)) {
    return value.join(", ");
  }
  try {
    return JSON.stringify(value);
  } catch (error) {
    return String(error);
  }
}

function sortSkills(a: Skill, b: Skill) {
  const getOriginPriority = (skill: Skill) => {
    if (skill.origin === "builtin") return 0;
    if (skill.origin) return 1;
    return 2;
  };
  const priorityDiff = getOriginPriority(a) - getOriginPriority(b);
  if (priorityDiff !== 0) return priorityDiff;
  return a.name.localeCompare(b.name);
}

export function SkillsManagement() {
  const { status, data, error, refresh } = useOpenClawResource<Skill[]>(fetchSkills, []);
  const [selectedId, setSelectedId] = useState<string | null>(null);

  const skills = useMemo(() => data ?? [], [data]);
  const sortedSkills = useMemo(() => [...skills].sort(sortSkills), [skills]);

  useEffect(() => {
    if (status !== "success" || !sortedSkills.length) {
      return;
    }

    const timer = setTimeout(() => {
      setSelectedId((prev) => {
        if (prev && sortedSkills.some((skill) => skill.id === prev)) {
          return prev;
        }
        return sortedSkills[0].id;
      });
    }, 0);

    return () => clearTimeout(timer);
  }, [status, sortedSkills]);

  const selectedSkill = useMemo(() => {
    if (!sortedSkills.length) return null;
    return sortedSkills.find((skill) => skill.id === selectedId) ?? sortedSkills[0];
  }, [sortedSkills, selectedId]);

  const selectedSkillMetadata = useMemo(() => {
    if (!selectedSkill?.metadata) return [];
    return Object.entries(selectedSkill.metadata);
  }, [selectedSkill]);

  const metadataPreview = selectedSkillMetadata.slice(0, 4);
  const metadataOverflow = Math.max(0, selectedSkillMetadata.length - metadataPreview.length);

  const builtinCount = sortedSkills.filter((skill) => skill.origin === "builtin").length;
  const customCount = sortedSkills.filter((skill) => !!skill.origin && skill.origin !== "builtin").length;
  const unknownCount = sortedSkills.filter((skill) => !skill.origin).length;

  const skillCategories = useMemo<SkillCategory[]>(() => {
    return CATEGORY_DEFINITIONS.map((definition) => ({
      key: definition.key,
      title: definition.title,
      description: definition.description,
      skills: sortedSkills.filter(definition.filter),
    })).filter((group) => group.skills.length > 0);
  }, [sortedSkills]);

  const header = (
    <PageHeader
      title="Skill inventory"
      context="Browse every OpenClaw skill in one place, grouped by whether it is built-in or custom. Changes must be made through the OpenClaw portal."
      supportingStatus={
        <>
          <Badge variant="muted">{sortedSkills.length} skill{sortedSkills.length === 1 ? "" : "s"}</Badge>
          <Badge variant="muted">Built-in {builtinCount}</Badge>
          <Badge variant="muted">Custom {customCount + unknownCount}</Badge>
          {selectedSkill ? statusBadge(selectedSkill.status) : <Badge variant="muted">{status === "loading" ? "Refreshing" : "No selection"}</Badge>}
          <Badge variant="muted">Read-only snapshot</Badge>
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
        <LoadingState title="Loading skills" description="Pulling live inventory from OpenClaw…" />
      </div>
    );
  }

  if (status === "error") {
    return (
      <div className="space-y-5 pb-6">
        {header}
        <ErrorState
          title="Unable to load skills"
          description={error ?? "Confirm OpenClaw is reachable and try again."}
          action={
            <Button variant="ghost" onClick={refresh}>
              Retry
            </Button>
          }
        />
      </div>
    );
  }

  if (!sortedSkills.length) {
    return (
      <div className="space-y-5 pb-6">
        {header}
        <EmptyState
          title="No skills surfaced"
          description="OpenClaw did not return any skills for your workspace yet."
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

      <div className="grid gap-5 lg:grid-cols-[360px_1fr]">
        <Card>
          <CardHeader>
            <CardTitle>Skills list</CardTitle>
            <CardDescription>Built-in skills are separated from custom/partner inventory for clarity.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {skillCategories.map((category) => (
              <section key={category.key} className="space-y-4">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="text-[11px] font-semibold uppercase tracking-[0.4em] text-zinc-500 dark:text-zinc-400">
                      {category.title}
                    </p>
                    <p className="text-xs text-zinc-500 dark:text-zinc-400">{category.description}</p>
                  </div>
                  <Badge variant="muted">{category.skills.length}</Badge>
                </div>
                <div className="space-y-3">
                  {category.skills.map((skill) => (
                    <button
                      key={skill.id}
                      type="button"
                      onClick={() => setSelectedId(skill.id)}
                      aria-pressed={selectedId === skill.id}
                      className={cn(
                        "w-full rounded-2xl border p-4 text-left transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--color-accent)]",
                        selectedId === skill.id
                          ? "border-zinc-900 bg-zinc-900 text-white dark:border-zinc-100 dark:bg-zinc-100 dark:text-zinc-900"
                          : "border-zinc-200 bg-white/80 hover:border-zinc-300 hover:bg-zinc-50 dark:border-zinc-800 dark:bg-zinc-950 hover:dark:border-zinc-700 hover:dark:bg-zinc-900",
                      )}
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div className="space-y-1">
                          <div className="flex flex-wrap items-center gap-2">
                            <p className="text-sm font-semibold text-zinc-900 dark:text-zinc-50">{skill.name}</p>
                            <span className="text-[10px] uppercase tracking-[0.5em] text-zinc-500 dark:text-zinc-400">{category.title}</span>
                          </div>
                          <p className="text-[11px] text-zinc-500 dark:text-zinc-400">
                            {skill.owner ? `Owner: ${skill.owner}` : skill.slug ?? skill.id}
                          </p>
                          <div className="mt-1 flex flex-wrap gap-1 text-[11px]">
                            {statusBadge(skill.status)}
                            {originBadge(skill.origin)}
                          </div>
                        </div>
                        <div className="text-right text-[10px] font-semibold uppercase tracking-[0.3em] text-zinc-500 dark:text-zinc-400">
                          <span className="block text-[11px] font-bold text-zinc-900 dark:text-zinc-100">
                            {formatDateTime(skill.updatedAt ?? skill.createdAt)}
                          </span>
                          <span className="block text-[9px] font-normal">Updated</span>
                        </div>
                      </div>
                      <p className="mt-3 text-sm leading-6 text-zinc-600 dark:text-zinc-300">
                        {skill.summary ?? skill.description ?? "No summary provided."}
                      </p>
                      <div className="mt-4 flex items-center justify-between text-[11px] font-semibold uppercase tracking-[0.3em] text-zinc-500 dark:text-zinc-400">
                        <span>{skill.slug ? `Slug: ${skill.slug}` : `ID: ${skill.id}`}</span>
                        <span className="flex items-center gap-1">
                          {skill.isEnabled ? (
                            <CheckCircle2 className="size-4 text-emerald-500" />
                          ) : (
                            <Circle className="size-4 text-zinc-400" />
                          )}
                          {skill.isEnabled ? "Enabled" : "Disabled"}
                        </span>
                      </div>
                    </button>
                  ))}
                </div>
              </section>
            ))}
          </CardContent>
        </Card>

        {selectedSkill ? (
          <Card>
            <CardHeader>
              <CardTitle>Skill details</CardTitle>
              <CardDescription>Live governance, metadata, and lifecycle context from OpenClaw.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-5">
              <section className="space-y-3 rounded-2xl border border-zinc-200 bg-white p-4 dark:border-zinc-800 dark:bg-zinc-950">
                <div className="flex items-start justify-between gap-4">
                  <div className="space-y-2">
                    <p className="text-[11px] uppercase tracking-[0.4em] text-zinc-500 dark:text-zinc-400">Summary</p>
                    <p className="text-2xl font-semibold text-zinc-900 dark:text-zinc-50">{selectedSkill.name}</p>
                    <p className="text-sm text-zinc-600 dark:text-zinc-300">
                      {selectedSkill.description ?? selectedSkill.summary ?? "No description provided."}
                    </p>
                  </div>
                  <div className="flex flex-col items-end gap-2">
                    <div className="flex flex-wrap gap-2">
                      {statusBadge(selectedSkill.status)}
                      {enabledBadge(selectedSkill.isEnabled)}
                    </div>
                    {originBadge(selectedSkill.origin)}
                  </div>
                </div>
              </section>

              <div className="grid gap-4 md:grid-cols-2">
                <section className="space-y-2 rounded-2xl border border-zinc-200 bg-white p-4 dark:border-zinc-800 dark:bg-zinc-950">
                  <p className="text-[11px] uppercase tracking-[0.4em] text-zinc-500 dark:text-zinc-400">Trigger hints</p>
                  {selectedSkill.triggerHints && selectedSkill.triggerHints.length ? (
                    <ul className="space-y-2 text-sm text-zinc-700 dark:text-zinc-300">
                      {selectedSkill.triggerHints.map((hint) => (
                        <li key={hint} className="rounded-xl border border-zinc-200/80 bg-zinc-50 px-3 py-1 text-xs font-medium uppercase tracking-[0.3em] text-zinc-600 dark:border-zinc-800/80 dark:bg-zinc-900 dark:text-zinc-200">
                          {hint}
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <p className="text-sm text-zinc-500 dark:text-zinc-400">No trigger hints supplied.</p>
                  )}
                </section>
                <section className="space-y-2 rounded-2xl border border-zinc-200 bg-white p-4 dark:border-zinc-800 dark:bg-zinc-950">
                  <p className="text-[11px] uppercase tracking-[0.4em] text-zinc-500 dark:text-zinc-400">Tags</p>
                  {selectedSkill.tags && selectedSkill.tags.length ? (
                    <div className="flex flex-wrap gap-2">
                      {selectedSkill.tags.map((tag) => (
                        <Badge
                          key={tag}
                          className="bg-zinc-900 text-white dark:bg-white dark:text-black"
                          variant="default"
                        >
                          {tag}
                        </Badge>
                      ))}
                    </div>
                  ) : (
                    <p className="text-sm text-zinc-500 dark:text-zinc-400">No tags assigned.</p>
                  )}
                </section>
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <section className="space-y-3 rounded-2xl border border-zinc-200 bg-white p-4 dark:border-zinc-800 dark:bg-zinc-950">
                  <p className="text-[11px] uppercase tracking-[0.4em] text-zinc-500 dark:text-zinc-400">Governance</p>
                  <div className="space-y-3 text-sm text-zinc-700 dark:text-zinc-300">
                    <div>
                      <p className="text-[10px] uppercase tracking-[0.4em] text-zinc-500 dark:text-zinc-400">Owner</p>
                      <p className="font-semibold text-zinc-900 dark:text-white">{selectedSkill.owner ?? "Team-managed"}</p>
                    </div>
                    <div>
                      <p className="text-[10px] uppercase tracking-[0.4em] text-zinc-500 dark:text-zinc-400">Origin</p>
                      <p className="font-semibold text-zinc-900 dark:text-white">{getOriginDescription(selectedSkill.origin)}</p>
                    </div>
                    <div>
                      <p className="text-[10px] uppercase tracking-[0.4em] text-zinc-500 dark:text-zinc-400">Safety level</p>
                      <p className="font-semibold text-zinc-900 dark:text-white">{selectedSkill.safetyLevel ?? "Unknown"}</p>
                    </div>
                  </div>
                </section>
                <section className="space-y-3 rounded-2xl border border-zinc-200 bg-white p-4 dark:border-zinc-800 dark:bg-zinc-950">
                  <p className="text-[11px] uppercase tracking-[0.4em] text-zinc-500 dark:text-zinc-400">Lifecycle</p>
                  <div className="space-y-3 text-sm text-zinc-700 dark:text-zinc-300">
                    <div>
                      <p className="text-[10px] uppercase tracking-[0.4em] text-zinc-500 dark:text-zinc-400">Created</p>
                      <p className="font-semibold text-zinc-900 dark:text-white">{formatDateTime(selectedSkill.createdAt)}</p>
                    </div>
                    <div>
                      <p className="text-[10px] uppercase tracking-[0.4em] text-zinc-500 dark:text-zinc-400">Updated</p>
                      <p className="font-semibold text-zinc-900 dark:text-white">{formatDateTime(selectedSkill.updatedAt ?? selectedSkill.createdAt)}</p>
                    </div>
                    <div>
                      <p className="text-[10px] uppercase tracking-[0.4em] text-zinc-500 dark:text-zinc-400">Identifier</p>
                      <p className="font-semibold text-zinc-900 dark:text-white">{selectedSkill.slug ?? selectedSkill.id}</p>
                    </div>
                  </div>
                </section>
              </div>

              <section className="rounded-2xl border border-zinc-200 bg-white p-4 dark:border-zinc-800 dark:bg-zinc-950">
                <p className="text-[11px] uppercase tracking-[0.4em] text-zinc-500 dark:text-zinc-400">Metadata</p>
                {selectedSkillMetadata.length ? (
                  <div className="mt-3 grid gap-3 text-sm text-zinc-700 dark:text-zinc-300">
                    {metadataPreview.map(([key, value]) => (
                      <div key={key} className="rounded-xl border border-zinc-200/80 bg-zinc-50/80 p-3 dark:border-zinc-800/80 dark:bg-zinc-900/70">
                        <p className="text-[10px] uppercase tracking-[0.4em] text-zinc-500 dark:text-zinc-400">{key}</p>
                        <p className="mt-1 font-semibold text-zinc-900 dark:text-white">{formatMetadataValue(value)}</p>
                      </div>
                    ))}
                    {metadataOverflow > 0 ? (
                      <p className="text-xs text-zinc-500 dark:text-zinc-400">+{metadataOverflow} more metadata points.</p>
                    ) : null}
                  </div>
                ) : (
                  <p className="mt-3 text-sm text-zinc-500 dark:text-zinc-400">No metadata published from OpenClaw.</p>
                )}
              </section>
            </CardContent>
          </Card>
        ) : null}
      </div>
    </div>
  );
}
