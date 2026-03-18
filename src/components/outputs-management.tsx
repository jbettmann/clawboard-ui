"use client";

import { Bookmark, BookmarkCheck, Pin, PinOff, ScrollText, Sparkles } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useClawboardState } from "@/lib/clawboard-state";

export function OutputsManagement() {
  const {
    outputs,
    selectedOutputId,
    setSelectedOutputId,
    toggleOutputPinned,
    toggleOutputSaved,
  } = useClawboardState();

  const selectedOutput = outputs.find((item) => item.id === selectedOutputId) ?? outputs[0];

  return (
    <div className="space-y-5 pb-6">
      <Card>
        <CardHeader>
          <Badge variant="muted">Phase 4 · Outputs</Badge>
          <CardTitle className="mt-3 flex items-center gap-2 text-2xl">
            <ScrollText className="size-5 text-[var(--color-accent-primary)]" />
            Outputs center
          </CardTitle>
          <CardDescription className="text-base">
            Review finished outputs, open details, and keep the most useful items pinned or saved.
          </CardDescription>
        </CardHeader>
      </Card>

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
                <p className="mt-1 text-sm opacity-85">{output.summary}</p>
                <div className="mt-3 flex items-center gap-2">
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
    </div>
  );
}
