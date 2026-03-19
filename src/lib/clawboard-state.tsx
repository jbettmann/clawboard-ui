"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from "react";

import { fetchOutputs, OutputItem } from "@/lib/openclaw-client";

export type HomeWidgetId = "morning-brief" | "quick-actions" | "active-jobs" | "pinned-outputs";

export type HomeWidgetPreference = {
  id: HomeWidgetId;
  label: string;
  visible: boolean;
};

export type UserSettingKey = "dailyDigest" | "highlightSignals";
export type WorkspaceSettingKey = "autoRefresh" | "shareWorkspaceSignals";

export type UserSettings = Record<UserSettingKey, boolean>;
export type WorkspaceSettings = Record<WorkspaceSettingKey, boolean>;

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
  resetWidgetPreferences: () => void;
  userSettings: UserSettings;
  workspaceSettings: WorkspaceSettings;
  toggleUserSetting: (key: UserSettingKey) => void;
  toggleWorkspaceSetting: (key: WorkspaceSettingKey) => void;
};

const DEFAULT_WIDGET_PREFERENCES: HomeWidgetPreference[] = [
  { id: "morning-brief", label: "Morning brief", visible: true },
  { id: "quick-actions", label: "Quick actions", visible: true },
  { id: "active-jobs", label: "Active jobs", visible: true },
  { id: "pinned-outputs", label: "Pinned outputs", visible: true },
];

const DEFAULT_USER_SETTINGS: UserSettings = {
  dailyDigest: true,
  highlightSignals: true,
};

const DEFAULT_WORKSPACE_SETTINGS: WorkspaceSettings = {
  autoRefresh: true,
  shareWorkspaceSignals: false,
};

const STORAGE_KEY = "clawboard-ui-state-v1";

const ClawboardStateContext = createContext<ClawboardStateValue | null>(null);

function loadStoredState() {
  if (typeof window === "undefined") {
    return {
      selectedOutputId: null,
      widgetPreferences: DEFAULT_WIDGET_PREFERENCES,
      outputPreferences: {} as Record<string, { pinned?: boolean; saved?: boolean }>,
      userSettings: DEFAULT_USER_SETTINGS,
      workspaceSettings: DEFAULT_WORKSPACE_SETTINGS,
    };
  }

  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      return {
        selectedOutputId: null,
        widgetPreferences: DEFAULT_WIDGET_PREFERENCES,
        outputPreferences: {} as Record<string, { pinned?: boolean; saved?: boolean }>,
        userSettings: DEFAULT_USER_SETTINGS,
        workspaceSettings: DEFAULT_WORKSPACE_SETTINGS,
      };
    }

    const parsed = JSON.parse(raw) as {
      selectedOutputId?: string;
      widgetPreferences?: HomeWidgetPreference[];
      outputPreferences?: Record<string, { pinned?: boolean; saved?: boolean }>;
      userSettings?: UserSettings;
      workspaceSettings?: WorkspaceSettings;
    };

    const widgetPreferences = parsed.widgetPreferences?.length ? parsed.widgetPreferences : DEFAULT_WIDGET_PREFERENCES;
    const selectedOutputId = parsed.selectedOutputId ?? null;
    const outputPreferences = parsed.outputPreferences ?? {};
    const userSettings = { ...DEFAULT_USER_SETTINGS, ...parsed.userSettings };
    const workspaceSettings = { ...DEFAULT_WORKSPACE_SETTINGS, ...parsed.workspaceSettings };

    return { selectedOutputId, widgetPreferences, outputPreferences, userSettings, workspaceSettings };
  } catch {
    return {
      selectedOutputId: null,
      widgetPreferences: DEFAULT_WIDGET_PREFERENCES,
      outputPreferences: {} as Record<string, { pinned?: boolean; saved?: boolean }>,
      userSettings: DEFAULT_USER_SETTINGS,
      workspaceSettings: DEFAULT_WORKSPACE_SETTINGS,
    };
  }
}

export function ClawboardStateProvider({ children }: { children: React.ReactNode }) {
  const storedState = loadStoredState();
  const [outputs, setOutputs] = useState<OutputItem[]>([]);
  const [selectedOutputId, setSelectedOutputId] = useState<string | null>(storedState.selectedOutputId);
  const [widgetPreferences, setWidgetPreferences] = useState<HomeWidgetPreference[]>(storedState.widgetPreferences);
  const [outputPreferences, setOutputPreferences] = useState<Record<string, { pinned?: boolean; saved?: boolean }>>(
    storedState.outputPreferences,
  );
  const [userSettings, setUserSettings] = useState<UserSettings>(storedState.userSettings);
  const [workspaceSettings, setWorkspaceSettings] = useState<WorkspaceSettings>(storedState.workspaceSettings);
  const outputPreferencesRef = useRef(outputPreferences);
  const [outputsLoading, setOutputsLoading] = useState(true);
  const [outputsError, setOutputsError] = useState<string | null>(null);
  const [reloadToken, setReloadToken] = useState(0);

  const refreshOutputs = useCallback(() => setReloadToken((prev) => prev + 1), []);

  useEffect(() => {
    outputPreferencesRef.current = outputPreferences;
  }, [outputPreferences]);

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
        setOutputs((prevOutputs) => {
          const previousMap = new Map(prevOutputs.map((output) => [output.id, output]));
          const sanitized = items.map((item) => {
            const previous = previousMap.get(item.id);
            const stored = outputPreferencesRef.current[item.id];
            return {
              ...item,
              pinned: stored?.pinned ?? previous?.pinned ?? item.pinned ?? false,
              saved: stored?.saved ?? previous?.saved ?? item.saved ?? false,
            };
          });

          setSelectedOutputId((prevId) => {
            if (prevId && sanitized.some((output) => output.id === prevId)) {
              return prevId;
            }
            return sanitized[0]?.id ?? null;
          });

          return sanitized;
        });
        setOutputsError(null);
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
        JSON.stringify({
          selectedOutputId,
          widgetPreferences,
          outputPreferences,
          userSettings,
          workspaceSettings,
        }),
      );
    } catch {
      // Ignore storage write failures.
    }
  }, [selectedOutputId, widgetPreferences, outputPreferences, userSettings, workspaceSettings]);

  function toggleOutputPinned(id: string) {
    setOutputs((prev) => {
      const next = prev.map((output) => (output.id === id ? { ...output, pinned: !output.pinned } : output));
      const updated = next.find((output) => output.id === id);
      if (updated) {
        setOutputPreferences((existing) => ({
          ...existing,
          [id]: {
            ...(existing[id] ?? {}),
            pinned: updated.pinned,
          },
        }));
      }
      return next;
    });
  }

  function toggleOutputSaved(id: string) {
    setOutputs((prev) => {
      const next = prev.map((output) => (output.id === id ? { ...output, saved: !output.saved } : output));
      const updated = next.find((output) => output.id === id);
      if (updated) {
        setOutputPreferences((existing) => ({
          ...existing,
          [id]: {
            ...(existing[id] ?? {}),
            saved: updated.saved,
          },
        }));
      }
      return next;
    });
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

  function resetWidgetPreferences() {
    setWidgetPreferences(DEFAULT_WIDGET_PREFERENCES);
  }

  function toggleUserSetting(key: UserSettingKey) {
    setUserSettings((prev) => ({ ...prev, [key]: !prev[key] }));
  }

  function toggleWorkspaceSetting(key: WorkspaceSettingKey) {
    setWorkspaceSettings((prev) => ({ ...prev, [key]: !prev[key] }));
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
      resetWidgetPreferences,
      userSettings,
      workspaceSettings,
      toggleUserSetting,
      toggleWorkspaceSetting,
    }),
    [
      outputs,
      selectedOutputId,
      widgetPreferences,
      outputsLoading,
      outputsError,
      refreshOutputs,
      userSettings,
      workspaceSettings,
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
