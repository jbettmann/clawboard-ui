"use client";

import { useEffect, useMemo, useState } from "react";
import { ArrowRight, BotMessageSquare, Clock3, Loader2, Terminal, Toolbox, UserRound, type LucideIcon } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { EmptyState, ErrorState, LoadingState } from "@/components/ui/async-states";
import { PageHeader } from "@/components/page-header";
import {
  fetchChatMessages,
  fetchChatSessions,
  sendChatMessage,
  type ChatMessage,
  type ChatMessageRole,
  type ChatSession,
  type ChatSessionActivity,
  type SessionsSendResult,
} from "@/lib/openclaw-client";
import { useOpenClawResource } from "@/hooks/use-openclaw-resource";
import { StatusBadge } from "@/components/ui/status";
import { mapSessionActivityToStatus } from "@/lib/status-grammar";

const ROLE_ICON_MAP: Record<ChatMessageRole, LucideIcon> = {
  assistant: BotMessageSquare,
  user: UserRound,
  system: Terminal,
  tool: Toolbox,
};

const ROLE_LABEL_MAP: Record<ChatMessageRole, string> = {
  assistant: "Assistant",
  user: "You",
  system: "System event",
  tool: "Tool result",
};

const MESSAGE_STYLES: Record<ChatMessageRole, string> = {
  assistant:
    "border-zinc-200 bg-zinc-50 text-zinc-900 dark:border-zinc-800 dark:bg-zinc-950 dark:text-zinc-100",
  user: "ml-auto border-[var(--color-accent-border)] bg-[var(--color-accent-muted)] text-[var(--color-accent-foreground)]",
  system: "border-zinc-300 bg-zinc-50 text-zinc-700 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-300",
  tool: "border-zinc-300 bg-zinc-900 text-zinc-50 dark:border-zinc-600 dark:bg-zinc-950",
};

function activityBadge(activity: ChatSessionActivity) {
  const status = mapSessionActivityToStatus(activity);
  const label = activity === "active" ? "Active now" : activity === "waiting" ? "Waiting" : "Complete";
  return (
    <StatusBadge
      status={status}
      label={label}
      showIcon={false}
      className="text-[0.6rem]"
    />
  );
}

function activityLabel(activity: ChatSessionActivity) {
  if (activity === "active") return "In progress";
  if (activity === "waiting") return "Waiting on reply";
  if (activity === "complete") return "Complete";
  return "In progress";
}

function formatTimestamp(value?: string) {
  if (!value) return "—";
  const parsed = Date.parse(value);
  if (Number.isNaN(parsed)) return value;
  return new Intl.DateTimeFormat(undefined, { hour: "numeric", minute: "2-digit" }).format(parsed);
}

function formatDate(value?: string) {
  if (!value) return "—";
  const parsed = Date.parse(value);
  if (!Number.isNaN(parsed)) {
    return new Intl.DateTimeFormat(undefined, { dateStyle: "medium", timeStyle: "short" }).format(parsed);
  }
  return value;
}

function metadataValue(value?: unknown) {
  if (typeof value === "string" && value.trim().length) return value;
  if (typeof value === "number" || typeof value === "boolean") return String(value);
  return "—";
}

function capitalize(value?: string) {
  if (!value) return "Unknown";
  return `${value.charAt(0).toUpperCase()}${value.slice(1)}`;
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
  const [composerValue, setComposerValue] = useState("");
  const [isSending, setIsSending] = useState(false);
  const [sendError, setSendError] = useState<string | null>(null);
  const [sendResult, setSendResult] = useState<SessionsSendResult | null>(null);

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

  useEffect(() => {
    setComposerValue("");
    setSendError(null);
    setSendResult(null);
  }, [selectedSession?.id]);

  async function handleSend() {
    const trimmed = composerValue.trim();
    if (!selectedSession || !trimmed) {
      return;
    }

    setIsSending(true);
    setSendError(null);

    try {
      const result = await sendChatMessage(selectedSession.id, trimmed);
      setSendResult(result);
      setComposerValue("");
      refreshMessages();
      refreshSessions();
    } catch (error) {
      const message = error instanceof Error ? error.message : "Unable to send message.";
      setSendError(message);
    } finally {
      setIsSending(false);
    }
  }

  const nextStepText =
    selectedSession?.activity === "waiting"
      ? "Awaiting your reply."
      : selectedSession?.activity === "complete"
        ? "Start a new session when ready."
        : "Continue the conversation.";

  const header = (
    <PageHeader
      title="Chat workspace"
      context="Sessions track real conversations served by OpenClaw, not fake data."
      supportingStatus={
        <>
          {selectedSession ? activityBadge(selectedSession.activity) : <Badge variant="muted">No sessions</Badge>}
          {selectedSession ? <Badge variant="muted">{capitalize(selectedSession.status)}</Badge> : null}
          {selectedSession ? <Badge variant="muted">{selectedSession.channel}</Badge> : null}
          {selectedSession ? <Badge variant="muted">Last {formatTimestamp(selectedSession.lastMessageAt ?? selectedSession.updatedAt)}</Badge> : null}
        </>
      }
      primaryAction={
        <Button onClick={refreshSessions} size="lg" variant="secondary">
          Refresh sessions
        </Button>
      }
    />
  );

  if (sessionsStatus === "loading") {
    return (
      <div className="page-shell" data-density-mode="operations">
        {header}
        <LoadingState title="Loading chat sessions" description="Connecting to OpenClaw sessions…" />
      </div>
    );
  }

  if (sessionsStatus === "error") {
    return (
      <div className="page-shell" data-density-mode="operations">
        {header}
        <ErrorState
          title="Unable to load chat sessions"
          description={sessionsError ?? "Make sure the gateway is reachable and try again."}
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
      <div className="page-shell" data-density-mode="operations">
        {header}
        <EmptyState
          title="No chat sessions yet"
          description="Sessions appear here as soon as OpenClaw records a conversation."
          action={
            <Button variant="ghost" onClick={refreshSessions}>
              Refresh
            </Button>
          }
        />
      </div>
    );
  }

  const metadata = selectedSession?.metadata ?? {};
  const metadataRows = selectedSession
    ? [
        { label: "Channel", value: metadata.label ?? metadata.channel ?? selectedSession.channel },
        { label: "Provider", value: metadata.provider ?? metadata.origin ?? "OpenClaw" },
        { label: "Peer", value: metadata.from ?? metadata.sender ?? metadata.accountId },
        { label: "Thread", value: metadata.threadId ?? metadata.room ?? metadata.space },
        { label: "Session key", value: selectedSession.id },
        { label: "Started", value: selectedSession.createdAt },
      ]
    : [];

  return (
    <div className="page-shell" data-density-mode="operations">
      {header}

      <div className="grid gap-5 xl:grid-cols-[320px_1fr]">
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between gap-3">
              <div>
                <CardTitle>Sessions</CardTitle>
                <CardDescription>Browse real session signals and history.</CardDescription>
              </div>
              <Button variant="ghost" size="sm" onClick={refreshSessions}>
                Refresh
              </Button>
            </div>
          </CardHeader>
          <CardContent className="space-y-3">
            {sessions.map((session) => {
              const sessionStatus = mapSessionActivityToStatus(session.activity);
              return (
                <button
                key={session.id}
                type="button"
                onClick={() => setSelectedSessionId(session.id)}
                aria-pressed={activeSessionId === session.id}
                aria-label={`Open session ${session.title}`}
                className={`density-row w-full rounded-xl border text-left transition-colors ${
                  activeSessionId === session.id
                    ? "border-zinc-900 bg-zinc-900 text-zinc-50 dark:border-zinc-100 dark:bg-zinc-100 dark:text-zinc-900"
                    : "border-zinc-200 bg-zinc-50 hover:bg-zinc-100 dark:border-zinc-800 dark:bg-zinc-900 dark:hover:bg-zinc-800"
                }`}
              >
                <div className="flex items-center justify-between gap-2">
                  <p className="text-base font-semibold">{session.title}</p>
                  <div className="flex items-center gap-1">
                    {activityBadge(session.activity)}
                    <StatusBadge
                      status={sessionStatus}
                      label={capitalize(session.status)}
                      showIcon={false}
                      className="text-[0.6rem]"
                    />
                  </div>
                </div>
                <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">{session.channel}</p>
                <div className="mt-2 flex items-center justify-between text-xs text-zinc-500 dark:text-zinc-400">
                  <span>{session.messageCount ?? 0} messages</span>
                  <span>Updated {formatTimestamp(session.updatedAt)}</span>
                </div>
              </button>
              );
            })}
          </CardContent>
        </Card>

        <div className="space-y-5">
          <Card>
            <CardHeader>
              <div className="flex flex-wrap items-center gap-2">
                {selectedSession ? activityBadge(selectedSession.activity) : null}
                {selectedSession ? <Badge variant="muted">{capitalize(selectedSession.status)}</Badge> : null}
                {selectedSession ? <Badge variant="muted">{selectedSession.channel}</Badge> : null}
              </div>
              <CardTitle className="mt-3 text-2xl">{selectedSession?.title ?? "Session details"}</CardTitle>
              <CardDescription className="text-base">
                {selectedSession?.metadata?.label
                  ? `Origin: ${metadataValue(selectedSession.metadata?.label)}`
                  : "Sessions reflect the conversational history stored on the OpenClaw gateway."}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-3 md:grid-cols-3">
                <div className="rounded-xl border border-zinc-200 bg-white p-3 dark:border-zinc-700 dark:bg-zinc-950">
                  <p className="text-xs text-zinc-500">Current state</p>
                  <p className="mt-1 text-base font-medium text-zinc-900 dark:text-zinc-100">
                    {selectedSession ? activityLabel(selectedSession.activity) : "—"}
                  </p>
                </div>
                <div className="rounded-xl border border-zinc-200 bg-white p-3 dark:border-zinc-700 dark:bg-zinc-950">
                  <p className="text-xs text-zinc-500">Messages</p>
                  <p className="mt-1 text-base font-medium text-zinc-900 dark:text-zinc-100">
                    {selectedSession?.messageCount ?? 0}
                  </p>
                </div>
                <div className="rounded-xl border border-zinc-200 bg-white p-3 dark:border-zinc-700 dark:bg-zinc-950">
                  <p className="text-xs text-zinc-500">Last update</p>
                  <p className="mt-1 text-base font-medium text-zinc-900 dark:text-zinc-100">
                    {formatDate(selectedSession?.lastMessageAt ?? selectedSession?.updatedAt)}
                  </p>
                </div>
              </div>

              <div className="rounded-2xl border border-zinc-200 bg-zinc-50 p-4 dark:border-zinc-800 dark:bg-zinc-900">
                <p className="text-xs uppercase tracking-[0.3em] text-zinc-500 dark:text-zinc-400">Session metadata</p>
                <div className="mt-3 grid gap-2 sm:grid-cols-2">
                  {metadataRows.map((row) => (
                    <div key={`${selectedSession?.id ?? "session"}-${row.label}`} className="space-y-1">
                      <p className="text-[11px] text-zinc-500 uppercase tracking-[0.3em] dark:text-zinc-400">{row.label}</p>
                      <p className="text-sm text-zinc-900 dark:text-zinc-100">{metadataValue(row.value)}</p>
                    </div>
                  ))}
                </div>
              </div>

              <p className="text-sm text-zinc-500 dark:text-zinc-400">{nextStepText}</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <div className="flex items-center justify-between gap-3">
                <div>
                  <CardTitle>Message history</CardTitle>
                  <CardDescription>Streamed directly from the gateway.</CardDescription>
                </div>
                <Button variant="ghost" size="sm" onClick={refreshMessages}>
                  Refresh log
                </Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div
                className="max-h-[440px] space-y-3 overflow-y-auto rounded-2xl border border-zinc-200 bg-white p-4 dark:border-zinc-800 dark:bg-zinc-950"
                role="log"
                aria-live="polite"
                aria-label={`${selectedSession?.title ?? "Chat"} messages`}
              >
                {messagesStatus === "loading" ? (
                  <LoadingState title="Loading messages" description="Gathering conversation history…" />
                ) : messagesStatus === "error" ? (
                  <ErrorState
                    title="Unable to load messages"
                    description={messagesError ?? "Try refreshing the log."}
                    action={
                      <Button variant="ghost" onClick={refreshMessages}>
                        Retry
                      </Button>
                    }
                  />
                ) : sessionMessages.length ? (
                  sessionMessages.map((message) => {
                    const RoleIcon = ROLE_ICON_MAP[message.role];
                    return (
                      <div key={message.id} className={`max-w-[90%] rounded-2xl border px-4 py-3 ${MESSAGE_STYLES[message.role]}`}>
                        <p className="flex items-center gap-2 text-xs font-medium opacity-75">
                          <RoleIcon className="size-3.5" />
                          {ROLE_LABEL_MAP[message.role]} · {formatTimestamp(message.time)}
                        </p>
                        <p className="mt-1 text-base leading-7">{message.text}</p>
                      </div>
                    );
                  })
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

              <div className="space-y-2">
                <label className="sr-only" htmlFor="chat-composer">
                  Reply to session
                </label>
                <div className="flex items-start gap-3 rounded-2xl border border-zinc-200 bg-zinc-50 p-3 dark:border-zinc-800 dark:bg-zinc-900">
                  <textarea
                    id="chat-composer"
                    value={composerValue}
                    onChange={(event) => setComposerValue(event.target.value)}
                    disabled={!selectedSession || isSending}
                    placeholder="Respond through OpenClaw (simple requests work best)."
                    rows={3}
                    className="w-full resize-none rounded-xl border border-zinc-300 bg-white px-3 py-2 text-sm text-zinc-900 outline-none focus-visible:ring-2 focus-visible:ring-zinc-400 dark:border-zinc-700 dark:bg-zinc-950 dark:text-zinc-100"
                  />
                  <Button
                    onClick={handleSend}
                    disabled={!composerValue.trim() || !selectedSession || isSending}
                    className="h-11 px-4 text-sm"
                  >
                    {isSending ? (
                      <span className="inline-flex items-center gap-2">
                        <Loader2 className="size-4 animate-spin" />
                        Sending
                      </span>
                    ) : (
                      "Send reply"
                    )}
                  </Button>
                </div>
                {sendError ? (
                  <p className="text-sm text-red-600 dark:text-red-400">{sendError}</p>
                ) : sendResult?.status ? (
                  <p className="text-sm text-zinc-500 dark:text-zinc-400">
                    Last send: {capitalize(sendResult.status)}{sendResult.result ? ` · ${metadataValue(sendResult.result)}` : ""}
                  </p>
                ) : null}
                <div className="flex items-center justify-between rounded-xl border border-dashed border-zinc-300 bg-white/60 px-4 py-3 text-sm text-zinc-600 dark:border-zinc-700 dark:bg-zinc-900/30 dark:text-zinc-300">
                  <span className="flex items-center gap-2">
                    <Clock3 className="size-4" />
                    Messages travel through OpenClaw&apos;s sessions_send tool and respect send policy.
                  </span>
                  <span className="inline-flex items-center gap-1 text-zinc-500">
                    View full history <ArrowRight className="size-4" />
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
