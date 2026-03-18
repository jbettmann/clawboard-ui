"use client";

import { useMemo, useState } from "react";
import { CheckCircle2, Circle, Plus, Save, Sparkles, TriangleAlert } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

type SkillStatus = "ready" | "needs-review" | "draft";

type Skill = {
  id: string;
  name: string;
  summary: string;
  triggerHint: string;
  safetyLevel: "low" | "moderate" | "high";
  tags: string;
  status: SkillStatus;
  enabled: boolean;
  lastEdited: string;
};

const initialSkills: Skill[] = [
  {
    id: "weather",
    name: "Weather Brief",
    summary: "Gives clear daily weather updates in simple language.",
    triggerHint: "When user asks about weather or forecast",
    safetyLevel: "low",
    tags: "weather, forecast, daily",
    status: "ready",
    enabled: true,
    lastEdited: "Today, 07:12",
  },
  {
    id: "node-connect",
    name: "Node Connect",
    summary: "Guides device pairing and connection troubleshooting.",
    triggerHint: "When pairing fails or app cannot connect",
    safetyLevel: "moderate",
    tags: "devices, setup, troubleshooting",
    status: "needs-review",
    enabled: true,
    lastEdited: "Yesterday",
  },
  {
    id: "investment-radar",
    name: "Investment Radar",
    summary: "Builds morning investment ideas with cited evidence.",
    triggerHint: "When user asks for stock picks or market radar",
    safetyLevel: "high",
    tags: "finance, markets, morning",
    status: "draft",
    enabled: false,
    lastEdited: "2 days ago",
  },
];

function statusBadge(status: SkillStatus) {
  if (status === "ready") return <Badge className="bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-300">Ready</Badge>;
  if (status === "needs-review") {
    return <Badge className="bg-amber-100 text-amber-800 dark:bg-amber-900/35 dark:text-amber-300">Needs review</Badge>;
  }
  return <Badge variant="muted">Draft</Badge>;
}

export function SkillsManagement() {
  const [skills, setSkills] = useState<Skill[]>(initialSkills);
  const [selectedId, setSelectedId] = useState<string>(initialSkills[0].id);
  const [formState, setFormState] = useState<Skill>(initialSkills[0]);
  const [savedAt, setSavedAt] = useState<string>("Not saved yet");

  const selectedSkill = useMemo(
    () => skills.find((skill) => skill.id === selectedId) ?? skills[0],
    [skills, selectedId],
  );

  function selectSkill(id: string) {
    const skill = skills.find((item) => item.id === id);
    if (!skill) return;
    setSelectedId(id);
    setFormState(skill);
  }

  function updateField<K extends keyof Skill>(key: K, value: Skill[K]) {
    setFormState((prev) => ({ ...prev, [key]: value }));
  }

  function saveSkill() {
    setSkills((prev) => prev.map((skill) => (skill.id === formState.id ? { ...formState, lastEdited: "Just now" } : skill)));
    setSavedAt(`Saved ${new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}`);
  }

  function resetForm() {
    setFormState(selectedSkill);
  }

  function addSkill() {
    const id = `skill-${Date.now()}`;
    const newSkill: Skill = {
      id,
      name: "New skill",
      summary: "Describe what this skill helps with.",
      triggerHint: "When user asks for...",
      safetyLevel: "moderate",
      tags: "",
      status: "draft",
      enabled: false,
      lastEdited: "Just now",
    };
    setSkills((prev) => [newSkill, ...prev]);
    setSelectedId(id);
    setFormState(newSkill);
    setSavedAt("New draft created");
  }

  return (
    <div className="space-y-5 pb-6">
      <Card>
        <CardHeader>
          <Badge variant="muted">Phase 3 · Skills</Badge>
          <CardTitle className="mt-3 flex items-center gap-2 text-2xl">
            <Sparkles className="size-5 text-sky-500" />
            Skills management
          </CardTitle>
          <CardDescription className="text-base">
            Review and edit skills in a calm, readable layout with large controls and plain language.
          </CardDescription>
        </CardHeader>
      </Card>

      <div className="grid gap-5 lg:grid-cols-[320px_1fr]">
        <Card>
          <CardHeader>
            <CardTitle>Skills list</CardTitle>
            <CardDescription>Choose a skill to view details and edit settings.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <Button onClick={addSkill} variant="secondary" className="h-11 w-full justify-center text-base">
              <Plus className="size-4" />
              Add skill
            </Button>

            <div className="space-y-2">
              {skills.map((skill) => (
                <button
                  key={skill.id}
                  type="button"
                  onClick={() => selectSkill(skill.id)}
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

        <Card>
          <CardHeader>
            <CardTitle>Skill details</CardTitle>
            <CardDescription>Update behavior, trigger guidance, and safety controls.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
              <label className="space-y-2">
                <span className="text-sm font-medium text-zinc-700 dark:text-zinc-300">Skill name</span>
                <input
                  value={formState.name}
                  onChange={(e) => updateField("name", e.target.value)}
                  className="h-11 w-full rounded-lg border border-zinc-300 bg-white px-3 text-base outline-none focus:ring-2 focus:ring-zinc-400 dark:border-zinc-700 dark:bg-zinc-950"
                />
              </label>

              <label className="space-y-2">
                <span className="text-sm font-medium text-zinc-700 dark:text-zinc-300">Safety level</span>
                <select
                  value={formState.safetyLevel}
                  onChange={(e) => updateField("safetyLevel", e.target.value as Skill["safetyLevel"])}
                  className="h-11 w-full rounded-lg border border-zinc-300 bg-white px-3 text-base outline-none focus:ring-2 focus:ring-zinc-400 dark:border-zinc-700 dark:bg-zinc-950"
                >
                  <option value="low">Low (general help)</option>
                  <option value="moderate">Moderate (checks needed)</option>
                  <option value="high">High (strict controls)</option>
                </select>
              </label>
            </div>

            <label className="space-y-2">
              <span className="text-sm font-medium text-zinc-700 dark:text-zinc-300">What this skill does</span>
              <textarea
                value={formState.summary}
                onChange={(e) => updateField("summary", e.target.value)}
                rows={3}
                className="w-full rounded-lg border border-zinc-300 bg-white px-3 py-2 text-base outline-none focus:ring-2 focus:ring-zinc-400 dark:border-zinc-700 dark:bg-zinc-950"
              />
            </label>

            <label className="space-y-2">
              <span className="text-sm font-medium text-zinc-700 dark:text-zinc-300">Trigger guidance</span>
              <textarea
                value={formState.triggerHint}
                onChange={(e) => updateField("triggerHint", e.target.value)}
                rows={2}
                className="w-full rounded-lg border border-zinc-300 bg-white px-3 py-2 text-base outline-none focus:ring-2 focus:ring-zinc-400 dark:border-zinc-700 dark:bg-zinc-950"
              />
            </label>

            <label className="space-y-2">
              <span className="text-sm font-medium text-zinc-700 dark:text-zinc-300">Tags</span>
              <input
                value={formState.tags}
                onChange={(e) => updateField("tags", e.target.value)}
                className="h-11 w-full rounded-lg border border-zinc-300 bg-white px-3 text-base outline-none focus:ring-2 focus:ring-zinc-400 dark:border-zinc-700 dark:bg-zinc-950"
                placeholder="weather, daily, reports"
              />
            </label>

            <label className="flex items-center justify-between rounded-xl border border-zinc-200 bg-zinc-50 p-4 dark:border-zinc-800 dark:bg-zinc-900">
              <span>
                <p className="text-base font-medium text-zinc-900 dark:text-zinc-100">Skill enabled</p>
                <p className="text-sm text-zinc-600 dark:text-zinc-400">If turned off, this skill will never auto-run.</p>
              </span>
              <input
                type="checkbox"
                checked={formState.enabled}
                onChange={(e) => updateField("enabled", e.target.checked)}
                className="size-5 rounded border-zinc-300"
              />
            </label>

            <div className="rounded-xl border border-sky-200 bg-sky-50 p-4 text-sm text-sky-900 dark:border-sky-900/40 dark:bg-sky-950/20 dark:text-sky-200">
              <p className="flex items-center gap-2 font-medium">
                <TriangleAlert className="size-4" />
                Review tip
              </p>
              <p className="mt-1">Use short trigger guidance so routing stays predictable and easy to maintain.</p>
            </div>

            <div className="flex flex-wrap items-center gap-3">
              <Button onClick={saveSkill} className="h-11 px-5 text-base">
                <Save className="size-4" />
                Save changes
              </Button>
              <Button onClick={resetForm} variant="secondary" className="h-11 px-5 text-base">
                Reset form
              </Button>
              <p className="text-sm text-zinc-500 dark:text-zinc-400">{savedAt}</p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
