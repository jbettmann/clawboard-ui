import { getOpenClawCompatibilityConfig, resolveApiBaseUrl } from "@/lib/openclaw-compat";
import type {
  OpenClawChatMessage,
  OpenClawChatMessageRole,
  OpenClawChatSession,
  OpenClawChatSessionStatus,
  OpenClawDailyBrief,
  OpenClawJobHistoryEntry,
  OpenClawOutput,
  OpenClawOutputKind,
  OpenClawSkill,
  OpenClawSkillOrigin,
  OpenClawSkillStatus,
} from "@/lib/openclaw-domains";

export type StatusTone = "good" | "watch" | "neutral";

export type OutputItem = OpenClawOutput & {
  pinned: boolean;
  saved: boolean;
};

export type HomeSignal = {
  label: string;
  value: string;
  tone: StatusTone;
};

export type HomeReminder = {
  label: string;
  detail: string;
};

export type HomeJobSummary = {
  id: string;
  title: string;
  detail: string;
  eta: string;
  priority: string;
};

export type HomeOverview = {
  signals: HomeSignal[];
  reminder?: HomeReminder;
  activeJobs: HomeJobSummary[];
  pinnedOutputs: OutputItem[];
};

export type SkillStatus = OpenClawSkillStatus | string;
export type SkillOrigin = OpenClawSkillOrigin | string;
export type Skill = OpenClawSkill;

export type JobStatus = "running" | "scheduled" | "paused" | string;

export type Job = {
  id: string;
  name: string;
  purpose?: string;
  owner?: string;
  schedule?: string;
  scheduleText?: string;
  nextRun?: string;
  nextRunAt?: string;
  lastRunAt?: string;
  status: JobStatus;
  lastOutputId?: string;
  createdAt?: string;
  updatedAt?: string;
  metadata?: Record<string, unknown>;
};

export type ConnectionHealth = "healthy" | "attention" | "offline" | string;
export type ConnectionAuthState = "connected" | "needs-auth" | "not-connected" | string;

export type Connection = {
  id: string;
  name: string;
  target: string;
  type: string;
  health: ConnectionHealth;
  auth: ConnectionAuthState;
  latency: string;
  lastChecked: string;
  note: string;
};

export type ChatSessionActivity = "active" | "waiting" | "complete";

export type ChatSession = OpenClawChatSession & {
  activity: ChatSessionActivity;
  channel: string;
  updatedAt: string;
};

export type ChatMessageRole = OpenClawChatMessageRole;

export type ChatMessage = {
  id: string;
  sessionId: string;
  role: ChatMessageRole;
  text: string;
  time: string;
  metadata?: OpenClawChatMessage["metadata"];
};

export type StatusSnapshotItem = {
  label: string;
  value: string;
  tone: StatusTone;
};

export type StatusTimelineEvent = {
  time: string;
  title: string;
  detail: string;
  tone: StatusTone;
};

export type OutputKind = OpenClawOutputKind;
export type JobHistoryEntry = OpenClawJobHistoryEntry;
export type DailyBrief = OpenClawDailyBrief;

const compat = getOpenClawCompatibilityConfig();
const API_BASE_URL = resolveApiBaseUrl(compat).replace(/\/$/, "");

const ENDPOINTS = {
  home: process.env.NEXT_PUBLIC_OPENCLAW_ENDPOINT_HOME ?? "/dashboard/home",
  skills: process.env.NEXT_PUBLIC_OPENCLAW_ENDPOINT_SKILLS ?? "/skills",
  jobs: process.env.NEXT_PUBLIC_OPENCLAW_ENDPOINT_JOBS ?? "/jobs",
  outputs: process.env.NEXT_PUBLIC_OPENCLAW_ENDPOINT_OUTPUTS ?? "/outputs",
  connections: process.env.NEXT_PUBLIC_OPENCLAW_ENDPOINT_CONNECTIONS ?? "/connections",
  chatSessions: process.env.NEXT_PUBLIC_OPENCLAW_ENDPOINT_CHAT_SESSIONS ?? "/chat/sessions",
  chatMessages: process.env.NEXT_PUBLIC_OPENCLAW_ENDPOINT_CHAT_MESSAGES ?? "/chat/sessions/{sessionId}/messages",
  statusSnapshot: process.env.NEXT_PUBLIC_OPENCLAW_ENDPOINT_STATUS_SNAPSHOT ?? "/status/snapshot",
  statusTimeline: process.env.NEXT_PUBLIC_OPENCLAW_ENDPOINT_STATUS_TIMELINE ?? "/status/timeline",
  jobHistory: process.env.NEXT_PUBLIC_OPENCLAW_ENDPOINT_JOB_HISTORY ?? "/jobs/history",
  dailyBriefs: process.env.NEXT_PUBLIC_OPENCLAW_ENDPOINT_DAILY_BRIEFS ?? "/daily-briefs",
  toolsInvoke: process.env.NEXT_PUBLIC_OPENCLAW_ENDPOINT_TOOLS_INVOKE ?? "/tools/invoke",
};

function buildUrl(path: string) {
  if (path.startsWith("http://") || path.startsWith("https://")) {
    return path;
  }
  const safePath = path.startsWith("/") ? path : `/${path}`;
  return `${API_BASE_URL}${safePath}`;
}

function resolveChatMessagesPath(sessionId: string) {
  return ENDPOINTS.chatMessages.replace("{sessionId}", encodeURIComponent(sessionId));
}

function getBearerHeader(): { Authorization: string } | null {
  const token = process.env.NEXT_PUBLIC_OPENCLAW_BEARER_TOKEN;
  if (token) {
    return { Authorization: `Bearer ${token}` };
  }
  return null;
}

const SESSION_ACTIVITY_MAP: Record<OpenClawChatSessionStatus, ChatSessionActivity> = {
  active: "active",
  paused: "waiting",
  archived: "complete",
};

function deriveSessionActivity(status?: OpenClawChatSessionStatus): ChatSessionActivity {
  if (!status) return "waiting";
  return SESSION_ACTIVITY_MAP[status] ?? "waiting";
}

function deriveChannelLabel(session: OpenClawChatSession): string {
  const raw = session.metadata ?? {};
  const label = raw.label ?? raw.channel ?? raw.provider ?? raw.origin ?? "OpenClaw";
  if (typeof label === "string" && label.trim().length) {
    return label;
  }
  if (typeof raw.from === "string" && typeof raw.channel === "string") {
    return `${raw.channel} · ${raw.from}`;
  }
  return "OpenClaw";
}

function mergeSessionTimestamp(session: OpenClawChatSession) {
  return session.updatedAt ?? session.lastMessageAt ?? session.createdAt ?? "";
}

function mapChatSession(session: OpenClawChatSession): ChatSession {
  return {
    ...session,
    activity: deriveSessionActivity(session.status),
    channel: deriveChannelLabel(session),
    updatedAt: mergeSessionTimestamp(session),
  };
}

function parseTimestamp(value?: string) {
  const parsed = Date.parse(value ?? "");
  return Number.isNaN(parsed) ? 0 : parsed;
}

type ToolInvokeArgs = Record<string, unknown> | undefined;

export type ToolInvokeRequest = {
  tool: string;
  action: string;
  args?: ToolInvokeArgs;
  sessionKey?: string;
};

export type ToolInvokeResponse<T = Record<string, unknown>> = {
  ok: boolean;
  result?: T;
  error?: {
    message: string;
    code?: string;
    details?: unknown;
  };
};

async function invokeTool<T>(payload: ToolInvokeRequest) {
  const response = await openClawRequest<ToolInvokeResponse<T>>(ENDPOINTS.toolsInvoke, {
    method: "POST",
    body: payload,
  });

  if (!response.ok) {
    throw new OpenClawError(
      200,
      buildUrl(ENDPOINTS.toolsInvoke),
      response.error ?? { message: "Tool invocation failed" },
    );
  }

  return (response.result ?? ({} as T)) as T;
}

export interface SessionsSendOptions {
  timeoutSeconds?: number;
}

export interface SessionsSendResult {
  status?: string;
  result?: string;
  runId?: string;
  sessionId?: string;
  announceId?: string;
  error?: string;
}

export async function sendChatMessage(
  sessionId: string,
  message: string,
  options?: SessionsSendOptions,
): Promise<SessionsSendResult> {
  const payload: ToolInvokeRequest = {
    tool: "sessions_send",
    action: "json",
    sessionKey: sessionId,
    args: {
      sessionKey: sessionId,
      message,
      timeoutSeconds: options?.timeoutSeconds ?? 15,
    },
  };

  return invokeTool<SessionsSendResult>(payload);
}

export type OpenClawRequestMethod = "GET" | "POST" | "PUT" | "PATCH" | "DELETE" | "OPTIONS" | "HEAD";
export type OpenClawRequestParams = Record<string, string | number | boolean | null | undefined>;

export interface OpenClawRequestOptions {
  method?: OpenClawRequestMethod;
  params?: OpenClawRequestParams;
  body?: BodyInit | Record<string, unknown> | null;
  headers?: HeadersInit;
  signal?: AbortSignal;
  cache?: RequestCache;
  parseJson?: boolean;
}

function appendSearchParams(url: URL, params?: OpenClawRequestParams) {
  if (!params) {
    return;
  }
  Object.entries(params).forEach(([key, value]) => {
    if (value === undefined || value === null) {
      return;
    }
    url.searchParams.set(key, String(value));
  });
}

function normalizeHeaders(headers?: HeadersInit) {
  const normalized = new Headers({ Accept: "application/json" });
  const bearer = getBearerHeader();
  if (bearer) {
    normalized.set("Authorization", bearer.Authorization);
  }

  if (headers instanceof Headers) {
    headers.forEach((value, key) => normalized.set(key, value));
  } else if (Array.isArray(headers)) {
    headers.forEach(([key, value]) => normalized.set(key, value));
  } else if (typeof headers === "object" && headers !== null) {
    Object.entries(headers).forEach(([key, value]) => {
      if (value !== undefined) {
        normalized.set(key, value);
      }
    });
  }

  return normalized;
}

function buildRequestBody(body: BodyInit | Record<string, unknown> | null | undefined, headers: Headers) {
  if (body === null || body === undefined) {
    return undefined;
  }

  if (body instanceof FormData || body instanceof URLSearchParams || typeof body === "string" || body instanceof Blob) {
    return body;
  }

  if (!headers.has("content-type")) {
    headers.set("content-type", "application/json");
  }

  try {
    return JSON.stringify(body);
  } catch (error) {
    throw new Error(`Failed to serialize request body: ${(error as Error).message}`);
  }
}

async function parseResponse<T>(response: Response, parseJson: boolean) {
  const text = await response.text();
  if (!parseJson) {
    return text as unknown as T;
  }

  if (!text) {
    return null as unknown as T;
  }

  try {
    return JSON.parse(text) as T;
  } catch (error) {
    throw new Error(`Unable to parse OpenClaw response as JSON (${(error as Error).message}): ${text}`);
  }
}

export class OpenClawError extends Error {
  readonly status: number;
  readonly url: string;
  readonly payload?: unknown;

  constructor(status: number, url: string, payload?: unknown) {
    super(`OpenClaw request failed with status ${status}`);
    this.name = "OpenClawError";
    this.status = status;
    this.url = url;
    this.payload = payload;
  }
}

export async function openClawRequest<T>(path: string, options: OpenClawRequestOptions = {}) {
  const { method = "GET", params, body, headers, signal, cache, parseJson = true } = options;
  const url = new URL(buildUrl(path));
  appendSearchParams(url, params);

  const normalizedHeaders = normalizeHeaders(headers);
  const payload = buildRequestBody(body, normalizedHeaders);

  const response = await fetch(url.toString(), {
    method,
    headers: normalizedHeaders,
    body: payload,
    signal,
    cache: cache ?? "no-store",
    credentials: compat.authMode === "session-cookie" ? "include" : "same-origin",
    mode: "cors",
  });

  const parsed = await parseResponse<unknown>(response, parseJson);

  if (!response.ok) {
    throw new OpenClawError(response.status, url.toString(), parsed);
  }

  return parsed as T;
}

export const openClawClient = {
  request: openClawRequest,
  get<T>(path: string, opts?: Omit<OpenClawRequestOptions, "method">) {
    return openClawRequest<T>(path, { ...opts, method: "GET" });
  },
  post<T>(path: string, opts?: Omit<OpenClawRequestOptions, "method">) {
    return openClawRequest<T>(path, { ...opts, method: "POST" });
  },
  put<T>(path: string, opts?: Omit<OpenClawRequestOptions, "method">) {
    return openClawRequest<T>(path, { ...opts, method: "PUT" });
  },
  patch<T>(path: string, opts?: Omit<OpenClawRequestOptions, "method">) {
    return openClawRequest<T>(path, { ...opts, method: "PATCH" });
  },
  delete<T>(path: string, opts?: Omit<OpenClawRequestOptions, "method">) {
    return openClawRequest<T>(path, { ...opts, method: "DELETE" });
  },
};

export async function openClawFetch<T>(path: string, init: RequestInit = {}) {
  return openClawRequest<T>(path, {
    method: (init.method as OpenClawRequestMethod | undefined) ?? "GET",
    headers: init.headers,
    body: init.body as BodyInit | Record<string, unknown> | null | undefined,
    signal: init.signal ?? undefined,
    cache: init.cache,
  });
}

export function fetchHomeOverview() {
  return openClawFetch<HomeOverview>(ENDPOINTS.home);
}

export function fetchSkills() {
  return openClawFetch<Skill[]>(ENDPOINTS.skills);
}

export function fetchJobs() {
  return openClawFetch<Job[]>(ENDPOINTS.jobs);
}

export function fetchOutputs() {
  return openClawFetch<OpenClawOutput[]>(ENDPOINTS.outputs).then((items) =>
    items.map((item) => ({
      ...item,
      pinned: false,
      saved: false,
    })),
  );
}

export function fetchConnections() {
  return openClawFetch<Connection[]>(ENDPOINTS.connections);
}

export function fetchChatSessions() {
  return openClawFetch<OpenClawChatSession[]>(ENDPOINTS.chatSessions).then((items) =>
    items
      .map(mapChatSession)
      .sort((a, b) => parseTimestamp(b.updatedAt) - parseTimestamp(a.updatedAt)),
  );
}

export function fetchChatMessages(sessionId: string) {
  const path = resolveChatMessagesPath(sessionId);
  return openClawFetch<OpenClawChatMessage[]>(path).then((items) =>
    items.map((message) => ({
      ...message,
      text: message.content,
      time: message.createdAt,
    })),
  );
}

export function fetchStatusSnapshot() {
  return openClawFetch<StatusSnapshotItem[]>(ENDPOINTS.statusSnapshot);
}

export function fetchStatusTimeline() {
  return openClawFetch<StatusTimelineEvent[]>(ENDPOINTS.statusTimeline);
}

export function fetchJobHistory(jobId?: string) {
  return openClawRequest<JobHistoryEntry[]>(ENDPOINTS.jobHistory, {
    params: jobId ? { jobId } : undefined,
  });
}

export function fetchDailyBriefs() {
  return openClawFetch<DailyBrief[]>(ENDPOINTS.dailyBriefs);
}
