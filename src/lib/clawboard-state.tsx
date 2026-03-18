"use client";

import { createContext, useContext, useEffect, useMemo, useState } from "react";

export type OutputItem = {
  id: string;
  title: string;
  summary: string;
  body: string;
  source: string;
  updatedAt: string;
  pinned: boolean;
  saved: boolean;
};

export type HomeWidgetId = "morning-brief" | "quick-actions" | "active-jobs" | "pinned-outputs";

export type HomeWidgetPreference = {
  id: HomeWidgetId;
  label: string;
  visible: boolean;
};

type ClawboardStateValue = {
  outputs: OutputItem[];
  selectedOutputId: string;
  widgetPreferences: HomeWidgetPreference[];
  setSelectedOutputId: (id: string) => void;
  toggleOutputPinned: (id: string) => void;
  toggleOutputSaved: (id: string) => void;
  moveWidget: (id: HomeWidgetId, direction: "up" | "down") => void;
  toggleWidgetVisibility: (id: HomeWidgetId) => void;
};

const defaultOutputs: OutputItem[] = [
  {
    id: "morning-brief-wed",
    title: "Morning Brief — Wednesday",
    summary: "A calm start with weather, priorities, and reminders.",
    body: "Today starts clear and cool. Priority one is your investment radar review before 08:30. Priority two is a quick node reconnect follow-up. There are two inbox items worth a short response before lunch.",
    source: "Daily companion",
    updatedAt: "6 minutes ago",
    pinned: true,
    saved: true,
  },
  {
    id: "home-healthcheck",
    title: "Home Security Healthcheck",
    summary: "No critical alerts. One firmware update suggested.",
    body: "All monitored systems are online. Front door camera uptime is healthy. Router firmware update is available and recommended this week during low activity hours.",
    source: "Healthcheck",
    updatedAt: "Yesterday",
    pinned: true,
    saved: false,
  },
  {
    id: "weekly-priorities",
    title: "Weekly Project Priorities",
    summary: "Three focus areas with light workload pacing.",
    body: "1) Finalize Clawboard phase work and validation. 2) Follow up on device pairing notes. 3) Prepare Friday summary with decisions and next actions.",
    source: "Project assistant",
    updatedAt: "This week",
    pinned: true,
    saved: true,
  },
  {
    id: "evening-wrap",
    title: "Evening Wrap — Tuesday",
    summary: "Completed jobs and tomorrow prep in one readable digest.",
    body: "Completed: heartbeat checks, job queue cleanup, and brief delivery. Pending for tomorrow: one skill review and one connection quality check.",
    source: "Jobs digest",
    updatedAt: "Last night",
    pinned: false,
    saved: false,
  },
];

const defaultWidgets: HomeWidgetPreference[] = [
  { id: "morning-brief", label: "Morning brief", visible: true },
  { id: "quick-actions", label: "Quick actions", visible: true },
  { id: "active-jobs", label: "Active jobs", visible: true },
  { id: "pinned-outputs", label: "Pinned outputs", visible: true },
];

const STORAGE_KEY = "clawboard-ui-state-v1";

const ClawboardStateContext = createContext<ClawboardStateValue | null>(null);

function loadInitialState() {
  if (typeof window === "undefined") {
    return {
      outputs: defaultOutputs,
      selectedOutputId: defaultOutputs[0].id,
      widgetPreferences: defaultWidgets,
    };
  }

  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      return {
        outputs: defaultOutputs,
        selectedOutputId: defaultOutputs[0].id,
        widgetPreferences: defaultWidgets,
      };
    }

    const parsed = JSON.parse(raw) as {
      outputs?: OutputItem[];
      selectedOutputId?: string;
      widgetPreferences?: HomeWidgetPreference[];
    };

    const outputs = parsed.outputs?.length ? parsed.outputs : defaultOutputs;
    const selectedOutputId = parsed.selectedOutputId ?? outputs[0].id;
    const widgetPreferences = parsed.widgetPreferences?.length ? parsed.widgetPreferences : defaultWidgets;

    return { outputs, selectedOutputId, widgetPreferences };
  } catch {
    return {
      outputs: defaultOutputs,
      selectedOutputId: defaultOutputs[0].id,
      widgetPreferences: defaultWidgets,
    };
  }
}

export function ClawboardStateProvider({ children }: { children: React.ReactNode }) {
  const initialState = loadInitialState();
  const [outputs, setOutputs] = useState<OutputItem[]>(initialState.outputs);
  const [selectedOutputId, setSelectedOutputId] = useState<string>(initialState.selectedOutputId);
  const [widgetPreferences, setWidgetPreferences] = useState<HomeWidgetPreference[]>(initialState.widgetPreferences);

  useEffect(() => {
    try {
      window.localStorage.setItem(
        STORAGE_KEY,
        JSON.stringify({ outputs, selectedOutputId, widgetPreferences }),
      );
    } catch {
      // Ignore storage write failures.
    }
  }, [outputs, selectedOutputId, widgetPreferences]);

  function toggleOutputPinned(id: string) {
    setOutputs((prev) => prev.map((output) => (output.id === id ? { ...output, pinned: !output.pinned } : output)));
  }

  function toggleOutputSaved(id: string) {
    setOutputs((prev) => prev.map((output) => (output.id === id ? { ...output, saved: !output.saved } : output)));
  }

  function moveWidget(id: HomeWidgetId, direction: "up" | "down") {
    setWidgetPreferences((prev) => {
      const index = prev.findIndex((item) => item.id === id);
      if (index < 0) return prev;
      const nextIndex = direction === "up" ? index - 1 : index + 1;
      if (nextIndex < 0 || nextIndex >= prev.length) return prev;
      const copy = [...prev];
      const [item] = copy.splice(index, 1);
      copy.splice(nextIndex, 0, item);
      return copy;
    });
  }

  function toggleWidgetVisibility(id: HomeWidgetId) {
    setWidgetPreferences((prev) => prev.map((item) => (item.id === id ? { ...item, visible: !item.visible } : item)));
  }

  const value = useMemo(
    () => ({
      outputs,
      selectedOutputId,
      widgetPreferences,
      setSelectedOutputId,
      toggleOutputPinned,
      toggleOutputSaved,
      moveWidget,
      toggleWidgetVisibility,
    }),
    [outputs, selectedOutputId, widgetPreferences],
  );

  return <ClawboardStateContext.Provider value={value}>{children}</ClawboardStateContext.Provider>;
}

export function useClawboardState() {
  const context = useContext(ClawboardStateContext);
  if (!context) {
    throw new Error("useClawboardState must be used within ClawboardStateProvider");
  }
  return context;
}
