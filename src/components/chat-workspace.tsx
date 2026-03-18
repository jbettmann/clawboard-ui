"use client";

import { useCallback, useMemo, useState, type KeyboardEvent } from "react";
import { BotMessageSquare, Clock3, UserRound } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { EmptyState, ErrorState, LoadingState } from "@/components/ui/async-states";
import { PageHeader } from "@/components/page-header";
import {
  fetchChatMessages,
  fetchChatSessions,
  sendChatMessage,
} from "@/lib/openclaw-client";
import type {
  OpenClawChatMessage,
  OpenClawChatSession,
  OpenClawChatSessionStatus,
} from "@/lib/openclaw-domains";
import { useOpenClawResource } from "@/hooks/use-openclaw-resource";

const STATUS_BADGES: Record<
  OpenClawChatSessionStatus,
  { label: string; className: string; helper: string }
> = {
  active: {
    label: "Active",
    className: "bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-200",
    helper: "Live conversation",
  },
  paused: {
    label: "Paused",
    className: "bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-200",
    helper: "Needs your reply",
  },
  archived: {
    label: "Archived",
    className: "bg-zinc-100 text-zinc-900 dark:bg-zinc-800 dark:text-zinc-200",
    helper: "Conversation archived",
  },
};

function renderSessionBadge(status?: OpenClawChatSessionStatus) {
  if (!status) {
    return <Badge variant="muted">Status pending</Badge>;
  }

  const meta = STATUS_BADGES[status];
  if (!meta) {
    return <Badge variant="muted">Status unknown</Badge>;
  }

  return <Badge className={meta.className}>{meta.label}</Badge>;
}

function statusHelperText(status?: OpenClawChatSessionStatus) {
  if (!status) {
    return "Select a session to view its activity.";
  }
  return STATUS_BADGES[status]?.helper ?? "Conversation status unknown.";
}

function nextStepText(status?: OpenClawChatSessionStatus) {
  if (status === "paused") {
    return "Send a reply to bring this conversation back online.";
  }
  if (status === "archived") {
    return "Start a new session whenever you need fresh context.";
  }
  if (status === "active") {
    return "Continue the conversation or ask for a new focus.";
  }
  return "Select a session to see what to do next.";
}

function deriveContextLabel(session?: OpenClawChatSession) {
  if (!session) {
    return "OpenClaw chat";
  }
  const channel = session.metadata?.channel;
  if (typeof channel === "string" && channel.trim()) {
    return channel;
  }
  const topic = session.metadata?.topic;
  if (typeof topic === "string" && topic.trim()) {
    return topic;
  }
  if (session.messageCount && session.messageCount > 0) {
    return `${session.messageCount} message${session.messageCount === 1 ? "" : "s"}`;
  }
  return "OpenClaw chat session";
}

function formatTimestamp(value?: string) {
  if (!value) return "—";
  const parsed = Date.parse(value);
  if (Number.isNaN(parsed)) return value;
  return new Intl.DateTimeFormat(undefined, { hour: "numeric", minute: "2-digit" }).format(parsed);
}

function formatMessageRole(role: OpenClawChatMessage["role"]) {
  if (role === "assistant") return "Assistant";
  if (role === "user") return "You";
  if (role === "system") return "System";
  return "Tool";
}

function extractLastUpdate(session?: OpenClawChatSession) {
  return session?.lastMessageAt ?? session?.updatedAt ?? session?.createdAt;
}

export function ChatWorkspace() {
  const {
    status: sessionsStatus,
    data: sessionsData,
    error: sessionsError,
    refresh: refreshSessions,
  } = useOpenClawResource<OpenClawChatSession[]>(fetchChatSessions, []);
  const sessions = useMemo(() => sessionsData ?? [], [sessionsData]);
  const [selectedSessionId, setSelectedSessionId] = useState<string | null>(null);

  const activeSessionId = selectedSessionId ?? sessions[0]?.id ?? null;
  const selectedSession =
    sessions.find((session) => session.id === activeSessionId) ?? sessions[0] ?? null;

  const {
    status: messagesStatus,
    data: messagesData,
    error: messagesError,
    refresh: refreshMessages,
  } = useOpenClawResource<OpenClawChatMessage[]>(
    () => (activeSessionId ? fetchChatMessages(activeSessionId) : Promise.resolve([])),
    [activeSessionId],
  );

  const sessionMessages = messagesData ?? [];
  const [composerValue, setComposerValue] = useState("");
  const [isSending, setIsSending] = useState(false);
  const [sendError, setSendError] = useState<string | null>(null);

  const handleSend = useCallback(async () => {
    if (!activeSessionId || !composerValue.trim()) {
      return;
    }
    setIsSending(true);
    setSendError(null);
    try {
      await sendChatMessage(activeSessionId, composerValue.trim());
      setComposerValue("");
      await Promise.all([refreshMessages(), refreshSessions()]);
    } catch (error) {
      setSendError((error as Error)?.message ?? "Unable to deliver your message.");
    } finally {
      setIsSending(false);
    }
  }, [activeSessionId, composerValue, refreshMessages, refreshSessions]);

  const handleComposerKeyDown = (event: KeyboardEvent<HTMLTextAreaElement>) => {
    if (event.key === "Enter" && !event.shiftKey) {
      event.preventDefault();
      void handleSend();
    }
  };

  const nextStep = nextStepText(selectedSession?.status);
  const statusDetail = statusHelperText(selectedSession?.status);
  const sessionContext = deriveContextLabel(selectedSession);
  const lastUpdate = formatTimestamp(extractLastUpdate(selectedSession));

  const header = (
    <PageHeader
      title="Chat workspace"
      context="Guided conversations with clear session signals and tidy history."
      supportingStatus={
        <>
          {selectedSession ? (
            <>
              {renderSessionBadge(selectedSession.status)}
              <Badge variant="muted">{selectedSession.messageCount} messages</Badge>
              <Badge variant="muted">Updated {lastUpdate}</Badge>
            </>
          ) : (
            <Badge variant="muted">Awaiting chat sessions</Badge>
          )}
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
            {sessions.map((session) => {
              const lastSeen = formatTimestamp(extractLastUpdate(session));
              const isActive = activeSessionId === session.id;
              return (
                <button
                  key={session.id}
                  type="button"
                  onClick={() => setSelectedSessionId(session.id)}
                  aria-pressed={isActive}
                  aria-label={`Open session ${session.title}`}
                  className={`w-full rounded-xl border p-4 text-left transition-colors ${
                    isActive
                      ? "border-zinc-900 bg-zinc-900 text-zinc-50 dark:border-zinc-100 dark:bg-zinc-100 dark:text-zinc-900"
                      : "border-zinc-200 bg-zinc-50 hover:bg-zinc-100 dark:border-zinc-800 dark:bg-zinc-900 dark:hover:bg-zinc-800"
                  }`}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="text-base font-semibold">{session.title}</p>
                      <p className="text-xs text-zinc-500 dark:text-zinc-400">{deriveContextLabel(session)}</p>
                    </div>
                    <div className="flex flex-col items-end gap-2">
                      {renderSessionBadge(session.status)}
                      <Badge variant="muted">{session.messageCount} messages</Badge>
                    </div>
                  </div>
                  <p className="mt-2 text-xs text-zinc-500">Updated {lastSeen}</p>
                </button>
              );
            })}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <div className="flex flex-wrap items-center gap-2">
              {renderSessionBadge(selectedSession?.status)}
              <Badge variant="muted">{sessionContext}</Badge>
            </div>
            <CardTitle className="mt-3 text-2xl">{selectedSession?.title ?? "Select a session"}</CardTitle>
            <CardDescription className="text-base">
              Messages are grouped and spaced for easy reading.
            </CardDescription>
            {selectedSession ? (
              <p className="text-xs text-zinc-500 dark:text-zinc-400">Last update {lastUpdate}</p>
            ) : null}
          </CardHeader>

          <CardContent className="space-y-4">
            <div className="rounded-2xl border border-zinc-200/80 bg-zinc-50/70 p-4 text-sm text-zinc-700 dark:border-zinc-800/60 dark:bg-zinc-950 dark:text-zinc-300">
              <div className="flex items-center justify-between gap-2">
                <p className="text-xs font-semibold uppercase tracking-[0.3em] text-zinc-500 dark:text-zinc-400">
                  Current focus
                </p>
                <span className="text-xs text-zinc-500 dark:text-zinc-400">{statusDetail}</span>
              </div>
              <p className="mt-2 text-base font-semibold text-zinc-900 dark:text-zinc-100">{nextStep}</p>
            </div>

            <div
              className="max-h-[420px] space-y-3 overflow-y-auto rounded-2xl border border-zinc-200 bg-white p-4 dark:border-zinc-800 dark:bg-zinc-950"
              role="log"
              aria-live="polite"
              aria-label={`${selectedSession?.title ?? "Chat"} messages`}
            >
              {selectedSession ? (
                messagesStatus === "loading" ? (
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
                        {formatMessageRole(message.role)} · {formatTimestamp(message.createdAt)}
                      </p>
                      <p className="mt-1 text-base leading-7">{message.content}</p>
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
                )
              ) : (
                <EmptyState title="No session selected" description="Choose a session to load history." />
              )}
            </div>

            <div className="flex flex-col gap-2 rounded-2xl border border-zinc-200 bg-zinc-50/70 p-3 dark:border-zinc-800 dark:bg-zinc-900">
              <textarea
                value={composerValue}
                onChange={(event) => setComposerValue(event.target.value)}
                onKeyDown={handleComposerKeyDown}
                placeholder={selectedSession ? "Type your reply…" : "Select a session to send a message."}
                rows={2}
                className="w-full resize-none rounded-xl border border-zinc-300 bg-white px-3 py-2 text-base text-zinc-600 outline-none focus-visible:ring-2 focus-visible:ring-zinc-400 dark:border-zinc-700 dark:bg-zinc-950 dark:text-zinc-300"
                disabled={!selectedSession || isSending}
              />
              <div className="flex items-center justify-between gap-3">
                {sendError ? (
                  <p className="text-xs text-rose-600" role="alert">
                    {sendError}
                  </p>
                ) : (
                  <p className="text-xs text-zinc-500 dark:text-zinc-400">
                    Enter sends, shift+enter adds a newline.
                  </p>
                )}
                <Button
                  type="button"
                  onClick={() => void handleSend()}
                  variant="default"
                  size="lg"
                  disabled={!selectedSession || !composerValue.trim() || isSending}
                  aria-busy={isSending}
                >
                  {isSending ? "Sending…" : "Send"}
                </Button>
              </div>
            </div>

            <div className="rounded-xl border border-dashed border-zinc-300 bg-zinc-50 px-4 py-3 text-sm text-zinc-700 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-300">
              <span className="flex items-center gap-2">
                <Clock3 className="size-4" />
                Tip: keep requests short and specific for calmer replies.
              </span>
              <p className="mt-1">
                Archived sessions can be referenced anytime; start a fresh one to keep momentum.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
