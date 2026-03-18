"use client";

import { useCallback, useMemo } from "react";

import { openClawClient, type OpenClawRequestParams } from "./openclaw-client";
import { useAsyncResource, type AsyncResource } from "./async-state";
import {
  OpenClawChatMessage,
  OpenClawChatSession,
  OpenClawConnectionHealth,
  OpenClawDailyBrief,
  OpenClawJob,
  OpenClawJobHistoryEntry,
  OpenClawOutput,
  OpenClawSkill,
} from "./openclaw-domains";

export const OPENCLAW_ROUTES = {
  skills: "/skills",
  jobs: "/jobs",
  jobHistory: "/jobs/history",
  outputs: "/outputs",
  dailyBriefs: "/daily-briefs",
  chatSessions: "/chat/sessions",
  chatMessages: (sessionId: string) => `/chat/sessions/${sessionId}/messages`,
  health: "/status/health",
} as const;

export interface UseOpenClawResourceOptions {
  params?: OpenClawRequestParams;
  autoStart?: boolean;
  parseJson?: boolean;
}

export function useOpenClawResource<T>(
  path: string,
  options?: UseOpenClawResourceOptions,
): AsyncResource<T> {
  const { params, autoStart, parseJson = true } = options ?? {};
  const stableParams = useMemo(() => params, [params]);

  const loader = useCallback(
    (signal: AbortSignal) => openClawClient.get<T>(path, { params: stableParams, signal, parseJson }),
    [path, stableParams, parseJson],
  );

  return useAsyncResource(loader, { autoStart });
}

export function useOpenClawSkills(options?: UseOpenClawResourceOptions) {
  return useOpenClawResource<OpenClawSkill[]>(OPENCLAW_ROUTES.skills, options);
}

export function useOpenClawJobs(options?: UseOpenClawResourceOptions) {
  return useOpenClawResource<OpenClawJob[]>(OPENCLAW_ROUTES.jobs, options);
}

export interface UseOpenClawJobHistoryOptions extends UseOpenClawResourceOptions {
  jobId?: string;
}

export function useOpenClawJobHistory(options?: UseOpenClawJobHistoryOptions) {
  const { jobId, ...rest } = options ?? {};
  const params = jobId ? { ...(rest.params ?? {}), jobId } : rest.params;
  return useOpenClawResource<OpenClawJobHistoryEntry[]>(OPENCLAW_ROUTES.jobHistory, {
    ...rest,
    params,
  });
}

export function useOpenClawOutputs(options?: UseOpenClawResourceOptions) {
  return useOpenClawResource<OpenClawOutput[]>(OPENCLAW_ROUTES.outputs, options);
}

export function useOpenClawDailyBriefs(options?: UseOpenClawResourceOptions) {
  return useOpenClawResource<OpenClawDailyBrief[]>(OPENCLAW_ROUTES.dailyBriefs, options);
}

export function useOpenClawChatSessions(options?: UseOpenClawResourceOptions) {
  return useOpenClawResource<OpenClawChatSession[]>(OPENCLAW_ROUTES.chatSessions, options);
}

export function useOpenClawChatMessages(sessionId: string, options?: UseOpenClawResourceOptions) {
  if (!sessionId) {
    throw new Error("useOpenClawChatMessages requires a sessionId");
  }
  return useOpenClawResource<OpenClawChatMessage[]>(OPENCLAW_ROUTES.chatMessages(sessionId), options);
}

export function useOpenClawConnectionHealth(options?: UseOpenClawResourceOptions) {
  return useOpenClawResource<OpenClawConnectionHealth>(OPENCLAW_ROUTES.health, options);
}
