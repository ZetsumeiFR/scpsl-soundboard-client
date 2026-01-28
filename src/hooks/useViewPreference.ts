import { useState, useCallback, useEffect } from "react";

export type ViewMode = "grid" | "list";

const STORAGE_KEY = "soundLibrary_viewMode";

export function useViewPreference(defaultView: ViewMode = "list") {
  const [viewMode, setViewModeState] = useState<ViewMode>(() => {
    if (typeof window === "undefined") return defaultView;
    const stored = localStorage.getItem(STORAGE_KEY);
    return stored === "grid" || stored === "list" ? stored : defaultView;
  });

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, viewMode);
  }, [viewMode]);

  const setViewMode = useCallback((mode: ViewMode) => {
    setViewModeState(mode);
  }, []);

  const toggleViewMode = useCallback(() => {
    setViewModeState((prev) => (prev === "grid" ? "list" : "grid"));
  }, []);

  return {
    viewMode,
    setViewMode,
    toggleViewMode,
    isGrid: viewMode === "grid",
    isList: viewMode === "list",
  };
}
