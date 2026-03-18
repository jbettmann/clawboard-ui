"use client";

import { useMemo, useState } from "react";
import { Activity, ArrowRight, BotMessageSquare, Clock3, UserRound } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { EmptyState, ErrorState, LoadingState } from "@/components/ui/async-states";
import { PageHeader } from "@/components/page-header";
import { fetchChatMessages, fetchChatSessions, type ChatMessage, type ChatSession } from "@/lib/openclaw-client";
import { useOpenClawResource } from "@/hooks/use-openclaw-resource";

function activityBadge(activity: ChatSession["activity"]) {
  if (activity === "active") {
    return <Badge className="bg-[var(--color-state-good)] text-[var(--color-surface-card)]">Active now</Badge>;
  }
  if (activity === "waiting") {
    return <Badge className="bg-[var(--color-state-watch)] text-[var(--color-surface-card)]">Waiting</Badge>;
  }
  return <Badge variant="muted">Complete</Badge>;
}

function activityLabel(activity: ChatSession["activity"]) {
  if (activity === "active") return "In progress";
  if (activity === "waiting") return "Waiting on reply";
  if (activity === "complete") return "Complete";
  return "In progress";
}

function formatTimestamp(value: string) {
  const parsed = Date.parse(value);
  if (!Number.isNaN(parsed)) {
    return new Intl.DateTimeFormat(undefined, { hour: "numeric", minute: "2-digit" }).format(parsed);
  }
  return value;
}

export function ChatWorkspace() {
  const {
    status: sessionsStatus,
    data: sessionsData,
    error: sessionsError,
    refresh: refreshSessions,
  } = useOpenClawResource<ChatSession[]>(fetchChatSessions, []);
  const sessions = useMemo(() => sessionsData ?? [], [sessionsData]);
  const [selectedSessionId, setSelectedSessionId] = useState<string | null>(null);

  const activeSessionId = selectedSessionId ?? sessions[0]?.id ?? null;
  const selectedSession = sessions.find((session) => session.id === activeSessionId) ?? sessions[0] ?? null;

  const {
    status: messagesStatus,
    data: messagesData,
    error: messagesError,
    refresh: refreshMessages,
  } = useOpenClawResource<ChatMessage[]>(
    () => (selectedSession ? fetchChatMessages(selectedSession.id) : Promise.resolve([])),
    [selectedSession?.id],
  );

  const sessionMessages = messagesData ?? [];

  const header = (
    <PageHeader
      title="Chat workspace"
      context="Guided conversations with clear session signals and tidy history."
      supportingStatus={
        <>
          {selectedSession ? activityBadge(selectedSession.activity) : <Badge variant="muted">No sessions</Badge>}
          {selectedSession ? <Badge variant="muted">{selectedSession.channel}</Badge> : null}
          {selectedSession ? (
            <Badge variant="muted">Updated {selectedSession.updatedAt}</Badge>
          ) : null}
        </>
      }
      primaryAction={
        <Button onClick={refreshSessions} size="lg" variant="secondary">
          Refresh
        </Button>
      }
    />
  );

  if (sessionsStatus === "loading") {
    return (
      <div className="space-y-5 pb-6">
        {header}
        <LoadingState title="Loading chat sessions" description="Connecting to OpenClaw chat…" />
      </div>
    );
  }

  if (sessionsStatus === "error") {
    return (
      <div className="space-y-5 pb-6">
        {header}
        <ErrorState
          title="Unable to load chat sessions"
          description={sessionsError ?? "Check your gateway and try refreshing."}
          action={
            <Button variant="ghost" onClick={refreshSessions}>
              Retry
            </Button>
          }
        />
      </div>
    );
  }

  if (!sessions.length) {
    return (
      <div className="space-y-5 pb-6">
        {header}
        <EmptyState
          title="No chat sessions yet"
          description="Start a conversation from OpenClaw to see it here."
          action={
            <Button variant="ghost" onClick={refreshSessions}>
              Refresh
            </Button>
          }
        />
      </div>
    );
  }

  const nextStepText =
    selectedSession?.activity === "waiting"
      ? "Awaiting your reply."
      : selectedSession?.activity === "complete"
        ? "Start a new session when ready."
        : "Continue the conversation.";

  return (
    <div className="space-y-5 pb-6">
      {header}

      <div className="grid gap-5 xl:grid-cols-[300px_1fr]">
        <Card>
          <CardHeader>
            <CardTitle>Sessions</CardTitle>
            <CardDescription>Pick a conversation and see what needs attention.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {sessions.map((session) => (
              <button
                key={session.id}
                type="button"
                onClick={() => setSelectedSessionId(session.id)}
                aria-pressed={activeSessionId === session.id}
                aria-label={`Open session ${session.title}`}
                className={`w-full rounded-xl border p-4 text-left transition-colors ${
                  activeSessionId === session.id
                    ? "border-zinc-900 bg-zinc-900 text-zinc-50 dark:border-zinc-100 dark:bg-zinc-100 dark:text-zinc-900"
                    : "border-zinc-200 bg-zinc-50 hover:bg-zinc-100 dark:border-zinc-800 dark:bg-zinc-900 dark:hover:bg-zinc-800"
                }`}
              >
                <div className="flex items-center justify-between gap-2">
                  <p className="text-base font-semibold">{session.title}</p>
                  {activityBadge(session.activity)}
                </div>
                <p className="mt-1 text-sm opacity-85">{session.channel}</p>
                <p className="mt-2 text-xs opacity-80">Updated {session.updatedAt}</p>
              </button>
            ))}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <div className="flex flex-wrap items-center gap-2">
              {selectedSession ? activityBadge(selectedSession.activity) : null}
              {selectedSession ? <Badge variant="muted">{selectedSession.channel}</Badge> : null}
            </div>
            <CardTitle className="mt-3 text-2xl">{selectedSession?.title}</CardTitle>
            <CardDescription className="text-base">Messages are grouped and spaced for easy reading.</CardDescription>
          </CardHeader>

          <CardContent className="space-y-4">
            <div className="rounded-2xl border border-zinc-200 bg-zinc-50 p-4 dark:border-zinc-800 dark:bg-zinc-900">
              <div className="mb-3 flex items-center gap-2 text-sm text-zinc-600 dark:text-zinc-300">
                <Activity className="size-4" />
                Session activity
              </div>
              <div className="grid gap-3 md:grid-cols-3">
                <div className="rounded-xl border border-zinc-200 bg-white p-3 dark:border-zinc-700 dark:bg-zinc-950">
                  <p className="text-xs text-zinc-500">Current state</p>
                  <p className="mt-1 text-base font-medium text-zinc-900 dark:text-zinc-100">
                    {selectedSession ? activityLabel(selectedSession.activity) : "—"}
                  </p>
                </div>
                <div className="rounded-xl border border-zinc-200 bg-white p-3 dark:border-zinc-700 dark:bg-zinc-950">
                  <p className="text-xs text-zinc-500">Last update</p>
                  <p className="mt-1 text-base font-medium text-zinc-900 dark:text-zinc-100">
                    {selectedSession?.updatedAt ?? "—"}
                  </p>
                </div>
                <div className="rounded-xl border border-zinc-200 bg-white p-3 dark:border-zinc-700 dark:bg-zinc-950">
                  <p className="text-xs text-zinc-500">Next step</p>
                  <p className="mt-1 text-base font-medium text-zinc-900 dark:text-zinc-100">{nextStepText}</p>
                </div>
              </div>
            </div>

            <div
              className="max-h-[420px] space-y-3 overflow-y-auto rounded-2xl border border-zinc-200 bg-white p-4 dark:border-zinc-800 dark:bg-zinc-950"
              role="log"
              aria-live="polite"
              aria-label={`${selectedSession?.title ?? "Chat"} messages`}
            >
              {messagesStatus === "loading" ? (
                <LoadingState title="Loading messages" description="Gathering conversation history…" />
              ) : messagesStatus === "error" ? (
                <ErrorState
                  title="Unable to load messages"
                  description={messagesError ?? "Try refreshing to reconnect to the session."}
                  action={
                    <Button variant="ghost" onClick={refreshMessages}>
                      Retry
                    </Button>
                  }
                />
              ) : sessionMessages.length ? (
                sessionMessages.map((message) => (
                  <div
                    key={message.id}
                    className={`max-w-[90%] rounded-2xl border px-4 py-3 ${
                      message.role === "assistant"
                        ? "border-zinc-200 bg-zinc-50 text-zinc-900 dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-100"
                        : "ml-auto border-[var(--color-accent-border)] bg-[var(--color-accent-muted)] text-[var(--color-accent-foreground)]"
                    }`}
                  >
                    <p className="flex items-center gap-2 text-xs font-medium opacity-75">
                      {message.role === "assistant" ? (
                        <BotMessageSquare className="size-3.5" />
                      ) : (
                        <UserRound className="size-3.5" />
                      )}
                      {message.role === "assistant" ? "Assistant" : "You"} · {formatTimestamp(message.time)}
                    </p>
                    <p className="mt-1 text-base leading-7">{message.text}</p>
                  </div>
                ))
              ) : (
                <EmptyState
                  title="No messages yet"
                  description="This session is just getting started."
                  action={
                    <Button variant="ghost" onClick={refreshMessages}>
                      Refresh
                    </Button>
                  }
                />
              )}
            </div>

            <div className="flex items-end gap-3 rounded-2xl border border-zinc-200 bg-zinc-50 p-3 dark:border-zinc-800 dark:bg-zinc-900">
              <textarea
                readOnly
                placeholder="Send is coming soon—this view is currently read-only."
                rows={2}
                className="w-full resize-none rounded-xl border border-zinc-300 bg-white px-3 py-2 text-base text-zinc-600 outline-none focus-visible:ring-2 focus-visible:ring-zinc-400 dark:border-zinc-700 dark:bg-zinc-950 dark:text-zinc-400"
              />
              <Button disabled className="h-11 px-4 text-base" aria-label="Send message">
                Send
              </Button>
            </div>

            <div className="flex items-center justify-between rounded-xl border border-dashed border-zinc-300 bg-zinc-50 px-4 py-3 text-sm text-zinc-700 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-300">
              <span className="flex items-center gap-2">
                <Clock3 className="size-4" />
                Tip: keep requests short and specific for calmer replies.
              </span>
              <span className="inline-flex items-center gap-1 text-zinc-500">
                View full history <ArrowRight className="size-4" />
              </span>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
