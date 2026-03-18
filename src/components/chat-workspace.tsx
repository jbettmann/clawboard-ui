"use client";

import { useMemo, useState } from "react";
import { Activity, ArrowRight, BotMessageSquare, Clock3, Send, UserRound } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

type ChatSession = {
  id: string;
  title: string;
  channel: string;
  updatedAt: string;
  activity: "active" | "waiting" | "complete";
};

type ChatMessage = {
  id: string;
  sessionId: string;
  role: "assistant" | "user";
  text: string;
  time: string;
};

const sessions: ChatSession[] = [
  {
    id: "morning-checkin",
    title: "Morning check-in",
    channel: "Direct chat",
    updatedAt: "2 min ago",
    activity: "active",
  },
  {
    id: "node-help",
    title: "Node reconnect help",
    channel: "Support thread",
    updatedAt: "18 min ago",
    activity: "waiting",
  },
  {
    id: "daily-wrap",
    title: "Daily wrap draft",
    channel: "Saved draft",
    updatedAt: "Yesterday",
    activity: "complete",
  },
];

const initialMessages: ChatMessage[] = [
  {
    id: "m-1",
    sessionId: "morning-checkin",
    role: "assistant",
    text: "Good morning, Jordan. I can walk through priorities, connections, and quick actions in one calm pass.",
    time: "07:28",
  },
  {
    id: "m-2",
    sessionId: "morning-checkin",
    role: "user",
    text: "Start with priorities and tell me if anything looks stuck.",
    time: "07:29",
  },
  {
    id: "m-3",
    sessionId: "morning-checkin",
    role: "assistant",
    text: "You have two high-value priorities: investment radar review and one node reconnect follow-up. Nothing is critical, but one connection health check is still pending.",
    time: "07:30",
  },
  {
    id: "m-4",
    sessionId: "node-help",
    role: "assistant",
    text: "Connection helper is open. I can guide re-pairing step by step when you're ready.",
    time: "07:10",
  },
  {
    id: "m-5",
    sessionId: "daily-wrap",
    role: "assistant",
    text: "Daily wrap draft is complete. Would you like a shorter version before sending tonight?",
    time: "Yesterday",
  },
];

function activityBadge(tone: ChatSession["activity"]) {
  if (tone === "active")
    return <Badge className="bg-[var(--color-state-good)] text-[var(--color-surface-card)]">Active now</Badge>;
  if (tone === "waiting")
    return <Badge className="bg-[var(--color-state-watch)] text-[var(--color-surface-card)]">Waiting</Badge>;
  return <Badge variant="muted">Complete</Badge>;
}

export function ChatWorkspace() {
  const [selectedSessionId, setSelectedSessionId] = useState<string>(sessions[0].id);
  const [composerText, setComposerText] = useState<string>("");
  const [messages, setMessages] = useState<ChatMessage[]>(initialMessages);

  const selectedSession = sessions.find((session) => session.id === selectedSessionId) ?? sessions[0];
  const sessionMessages = useMemo(
    () => messages.filter((message) => message.sessionId === selectedSession.id),
    [messages, selectedSession.id],
  );

  function sendMessage() {
    const trimmed = composerText.trim();
    if (!trimmed) return;

    setMessages((prev) => [
      ...prev,
      {
        id: `m-${Date.now()}`,
        sessionId: selectedSession.id,
        role: "user",
        text: trimmed,
        time: "Now",
      },
      {
        id: `m-${Date.now()}-assistant`,
        sessionId: selectedSession.id,
        role: "assistant",
        text: "Got it. I recorded that and can continue from here.",
        time: "Now",
      },
    ]);

    setComposerText("");
  }

  return (
    <div className="space-y-5 pb-6">
      <Card>
        <CardHeader>
          <Badge variant="muted">Phase 5 · Chat</Badge>
            <CardTitle className="mt-3 flex items-center gap-2 text-2xl">
              <BotMessageSquare className="size-5 text-[var(--color-accent-primary)]" />
            Chat workspace
          </CardTitle>
          <CardDescription className="text-base">
            A calm conversation surface with clear session status, readable messages, and simple activity cues.
          </CardDescription>
        </CardHeader>
      </Card>

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
                aria-pressed={selectedSessionId === session.id}
                aria-label={`Open session ${session.title}`}
                className={`w-full rounded-xl border p-4 text-left transition-colors ${
                  selectedSessionId === session.id
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
              {activityBadge(selectedSession.activity)}
              <Badge variant="muted">{selectedSession.channel}</Badge>
            </div>
            <CardTitle className="mt-3 text-2xl">{selectedSession.title}</CardTitle>
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
                    {selectedSession.activity === "active" ? "In progress" : selectedSession.activity === "waiting" ? "Waiting on reply" : "Complete"}
                  </p>
                </div>
                <div className="rounded-xl border border-zinc-200 bg-white p-3 dark:border-zinc-700 dark:bg-zinc-950">
                  <p className="text-xs text-zinc-500">Last update</p>
                  <p className="mt-1 text-base font-medium text-zinc-900 dark:text-zinc-100">{selectedSession.updatedAt}</p>
                </div>
                <div className="rounded-xl border border-zinc-200 bg-white p-3 dark:border-zinc-700 dark:bg-zinc-950">
                  <p className="text-xs text-zinc-500">Next step</p>
                  <p className="mt-1 text-base font-medium text-zinc-900 dark:text-zinc-100">Review and continue</p>
                </div>
              </div>
            </div>

            <div
              className="max-h-[420px] space-y-3 overflow-y-auto rounded-2xl border border-zinc-200 bg-white p-4 dark:border-zinc-800 dark:bg-zinc-950"
              role="log"
              aria-live="polite"
              aria-label={`${selectedSession.title} messages`}
            >
              {sessionMessages.map((message) => (
                <div
                  key={message.id}
                  className={`max-w-[90%] rounded-2xl border px-4 py-3 ${
                    message.role === "assistant"
                      ? "border-zinc-200 bg-zinc-50 text-zinc-900 dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-100"
                      : "ml-auto border-[var(--color-accent-border)] bg-[var(--color-accent-muted)] text-[var(--color-accent-foreground)]"
                  }`}
                >
                  <p className="flex items-center gap-2 text-xs font-medium opacity-75">
                    {message.role === "assistant" ? <BotMessageSquare className="size-3.5" /> : <UserRound className="size-3.5" />}
                    {message.role === "assistant" ? "Assistant" : "You"} · {message.time}
                  </p>
                  <p className="mt-1 text-base leading-7">{message.text}</p>
                </div>
              ))}
            </div>

            <div className="flex items-end gap-3 rounded-2xl border border-zinc-200 bg-zinc-50 p-3 dark:border-zinc-800 dark:bg-zinc-900">
              <label className="sr-only" htmlFor="chat-compose">
                Message
              </label>
              <textarea
                id="chat-compose"
                value={composerText}
                onChange={(event) => setComposerText(event.target.value)}
                placeholder="Type a clear next step or question…"
                rows={2}
                className="w-full resize-none rounded-xl border border-zinc-300 bg-white px-3 py-2 text-base outline-none focus:ring-2 focus:ring-zinc-400 dark:border-zinc-700 dark:bg-zinc-950"
              />
              <Button onClick={sendMessage} className="h-11 px-4 text-base" aria-label="Send message">
                <Send className="size-4" />
                Send
              </Button>
            </div>

            <div className="flex items-center justify-between rounded-xl border border-dashed border-zinc-300 bg-zinc-50 px-4 py-3 text-sm text-zinc-700 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-300">
              <span className="flex items-center gap-2">
                <Clock3 className="size-4" />
                Tip: keep requests short and specific for faster, calmer replies.
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
