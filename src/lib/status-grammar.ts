import type {
  StatusTone,
  JobStatus,
  JobHistoryEntry,
  SkillStatus,
  ConnectionHealth,
  ChatSessionActivity,
} from "@/lib/openclaw-client";

export type StatusVariant = "healthy" | "watch" | "offline" | "risk" | "loading" | "empty" | "error";

export function mapSignalToneToStatus(tone?: StatusTone): StatusVariant {
  if (!tone) {
    return "empty";
  }
  if (tone === "good") {
    return "healthy";
  }
  if (tone === "watch") {
    return "watch";
  }
  return "healthy";
}

export function mapConnectionHealthToStatus(health?: ConnectionHealth): StatusVariant {
  if (health === "healthy") {
    return "healthy";
  }
  if (health === "attention") {
    return "watch";
  }
  if (health === "offline") {
    return "offline";
  }
  return "watch";
}

export function mapJobStatusToStatus(status?: JobStatus): StatusVariant {
  if (!status) {
    return "empty";
  }
  const normalized = status.toLowerCase();
  if (normalized === "running") {
    return "healthy";
  }
  if (normalized === "scheduled") {
    return "watch";
  }
  if (normalized === "paused") {
    return "offline";
  }
  return "risk";
}

export function mapJobHistoryStatusToStatus(status?: JobHistoryEntry["status"]): StatusVariant {
  if (!status) {
    return "empty";
  }
  if (status === "success") {
    return "healthy";
  }
  if (status === "failure" || status === "timeout") {
    return "risk";
  }
  if (status === "canceled") {
    return "offline";
  }
  return "watch";
}

export function mapSkillStatusToStatus(status?: SkillStatus): StatusVariant {
  if (!status) {
    return "empty";
  }
  if (status === "ready") {
    return "healthy";
  }
  if (status === "needs-review" || status === "draft") {
    return "watch";
  }
  if (status === "retired") {
    return "offline";
  }
  return "watch";
}

export function mapSessionActivityToStatus(activity: ChatSessionActivity): StatusVariant {
  if (activity === "active") {
    return "healthy";
  }
  if (activity === "waiting") {
    return "watch";
  }
  return "offline";
}
