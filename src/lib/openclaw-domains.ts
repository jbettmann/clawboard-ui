export type OpenClawSafetyLevel = "low" | "moderate" | "high";

export type OpenClawSkillStatus = "ready" | "needs-review" | "draft" | "retired";
export type OpenClawSkillOrigin = "builtin" | "partner" | "custom";

export interface OpenClawSkill {
  id: string;
  slug: string;
  name: string;
  summary?: string;
  description?: string;
  triggerHints?: string[];
  tags?: string[];
  safetyLevel?: OpenClawSafetyLevel;
  status: OpenClawSkillStatus;
  isEnabled: boolean;
  origin?: OpenClawSkillOrigin;
  owner?: string;
  createdAt?: string;
  updatedAt?: string;
  metadata?: Record<string, unknown>;
}

export type OpenClawJobStatus = "running" | "scheduled" | "paused" | "failed" | "completed";

export interface OpenClawJob {
  id: string;
  name: string;
  purpose?: string;
  owner?: string;
  schedule: string;
  status: OpenClawJobStatus;
  nextRunAt?: string;
  lastRunAt?: string;
  createdAt?: string;
  updatedAt?: string;
  lastOutputId?: string;
  metadata?: Record<string, unknown>;
}

export type OpenClawJobHistoryStatus = "success" | "failure" | "canceled" | "timeout";

export interface OpenClawJobHistoryEntry {
  id: string;
  jobId: string;
  status: OpenClawJobHistoryStatus;
  startedAt: string;
  finishedAt?: string;
  durationMs?: number;
  summary?: string;
  outputId?: string;
  reason?: string;
  metadata?: Record<string, unknown>;
}

export type OpenClawOutputKind = "daily-brief" | "job" | "chat" | "system" | "manual";

export interface OpenClawOutput {
  id: string;
  title: string;
  summary?: string;
  body: string;
  kind: OpenClawOutputKind;
  source: string;
  createdAt: string;
  updatedAt: string;
  relatedJobId?: string;
  relatedSessionId?: string;
  metadata?: Record<string, unknown>;
}

export interface OpenClawOutputRef {
  id: string;
  title: string;
  kind: OpenClawOutputKind;
}

export interface OpenClawDailyBrief {
  id: string;
  title: string;
  date: string;
  summary: string;
  highlights: string[];
  outputs?: OpenClawOutputRef[];
  updatedAt?: string;
  metadata?: Record<string, unknown>;
}

export type OpenClawChatSessionStatus = "active" | "paused" | "archived";
export type OpenClawChatMessageRole = "user" | "assistant" | "system" | "tool";

export interface OpenClawChatSession {
  id: string;
  title: string;
  status: OpenClawChatSessionStatus;
  createdAt: string;
  updatedAt?: string;
  lastMessageAt?: string;
  messageCount: number;
  metadata?: Record<string, unknown>;
}

export interface OpenClawChatMessage {
  id: string;
  sessionId: string;
  role: OpenClawChatMessageRole;
  content: string;
  createdAt: string;
  metadata?: Record<string, unknown>;
}

export type OpenClawHealthStatus = "healthy" | "degraded" | "offline" | "unknown";

export interface OpenClawHealthCheck {
  component: string;
  status: OpenClawHealthStatus;
  details?: string;
  lastCheckedAt: string;
  latencyMs?: number;
  metadata?: Record<string, unknown>;
}

export interface OpenClawConnectionHealth {
  gateway: OpenClawHealthCheck;
  auth?: OpenClawHealthCheck;
  nodes?: OpenClawHealthCheck[];
  services?: Record<string, OpenClawHealthCheck>;
  metadata?: Record<string, unknown>;
}
