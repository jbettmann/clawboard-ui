"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";

import { fetchOutputs, OutputItem } from "@/lib/openclaw-client";

export type HomeWidgetId = "morning-brief" | "quick-actions" | "active-jobs" | "pinned-outputs";

export type HomeWidgetPreference = {
  id: HomeWidgetId;
  label: string;
  visible: boolean;
};

type ClawboardStateValue = {
  outputs: OutputItem[];
  selectedOutputId: string | null;
  widgetPreferences: HomeWidgetPreference[];
  outputsLoading: boolean;
  outputsError: string | null;
  refreshOutputs: () => void;
  setSelectedOutputId: (id: string | null) => void;
  toggleOutputPinned: (id: string) => void;
  toggleOutputSaved: (id: string) => void;
  moveWidget: (id: HomeWidgetId, direction: "up" | "down") => void;
  toggleWidgetVisibility: (id: HomeWidgetId) => void;
};

const DEFAULT_WIDGET_PREFERENCES: HomeWidgetPreference[] = [
  { id: "morning-brief", label: "Morning brief", visible: true },
  { id: "quick-actions", label: "Quick actions", visible: true },
  { id: "active-jobs", label: "Active jobs", visible: true },
  { id: "pinned-outputs", label: "Pinned outputs", visible: true },
];

const STORAGE_KEY = "clawboard-ui-state-v1";

const ClawboardStateContext = createContext<ClawboardStateValue | null>(null);

function loadStoredState() {
  if (typeof window === "undefined") {
    return {
      selectedOutputId: null,
      widgetPreferences: DEFAULT_WIDGET_PREFERENCES,
    };
  }

  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      return {
        selectedOutputId: null,
        widgetPreferences: DEFAULT_WIDGET_PREFERENCES,
      };
    }

    const parsed = JSON.parse(raw) as {
      selectedOutputId?: string;
      widgetPreferences?: HomeWidgetPreference[];
    };

    const widgetPreferences = parsed.widgetPreferences?.length ? parsed.widgetPreferences : DEFAULT_WIDGET_PREFERENCES;
    const selectedOutputId = parsed.selectedOutputId ?? null;

    return { selectedOutputId, widgetPreferences };
  } catch {
    return {
      selectedOutputId: null,
      widgetPreferences: DEFAULT_WIDGET_PREFERENCES,
    };
  }
}

export function ClawboardStateProvider({ children }: { children: React.ReactNode }) {
  const storedState = loadStoredState();
  const [outputs, setOutputs] = useState<OutputItem[]>([]);
  const [selectedOutputId, setSelectedOutputId] = useState<string | null>(storedState.selectedOutputId);
  const [widgetPreferences, setWidgetPreferences] = useState<HomeWidgetPreference[]>(storedState.widgetPreferences);
  const [outputsLoading, setOutputsLoading] = useState(true);
  const [outputsError, setOutputsError] = useState<string | null>(null);
  const [reloadToken, setReloadToken] = useState(0);

  const refreshOutputs = useCallback(() => setReloadToken((prev) => prev + 1), []);

  useEffect(() => {
    let canceled = false;
    const timer = setTimeout(() => {
      if (canceled) {
        return;
      }

      setOutputsLoading(true);

      fetchOutputs()
        .then((items) => {
          if (canceled) return;
          setOutputs(items);
          setOutputsError(null);
          setSelectedOutputId((prev) => {
            if (prev && items.some((item) => item.id === prev)) {
              return prev;
            }
            return items[0]?.id ?? null;
          });
        })
        .catch((error) => {
          if (canceled) return;
          setOutputsError(error?.message ?? "Unable to load outputs.");
        })
        .finally(() => {
          if (canceled) return;
          setOutputsLoading(false);
        });
    }, 0);

    return () => {
      canceled = true;
      clearTimeout(timer);
    };
  }, [reloadToken]);

  useEffect(() => {
    if (typeof window === "undefined") {
      return;
    }

    try {
      window.localStorage.setItem(
        STORAGE_KEY,
        JSON.stringify({ selectedOutputId, widgetPreferences }),
      );
    } catch {
      // Ignore storage write failures.
    }
  }, [selectedOutputId, widgetPreferences]);

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
      outputsLoading,
      outputsError,
      refreshOutputs,
      setSelectedOutputId,
      toggleOutputPinned,
      toggleOutputSaved,
      moveWidget,
      toggleWidgetVisibility,
    }),
    [
      outputs,
      selectedOutputId,
      widgetPreferences,
      outputsLoading,
      outputsError,
      refreshOutputs,
    ],
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
