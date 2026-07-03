import { useCallback, useEffect, useMemo, useState } from "react";
import type { HistoryEntry } from "./types";

const STORAGE_KEY = "calcpro-history";
const MAX_HISTORY_ITEMS = 200;

function loadHistory(): HistoryEntry[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return parsed;
  } catch {
    return [];
  }
}

function saveHistory(entries: HistoryEntry[]) {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(entries));
  } catch {
    // Ignore storage failures (e.g. quota exceeded, private browsing)
  }
}

export function useHistory() {
  const [history, setHistory] = useState<HistoryEntry[]>(() => loadHistory());
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    saveHistory(history);
  }, [history]);

  const addEntry = useCallback((expression: string, result: string) => {
    setHistory((prev) => {
      const entry: HistoryEntry = {
        id: `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`,
        expression,
        result,
        timestamp: Date.now(),
      };
      return [entry, ...prev].slice(0, MAX_HISTORY_ITEMS);
    });
  }, []);

  const deleteEntry = useCallback((id: string) => {
    setHistory((prev) => prev.filter((entry) => entry.id !== id));
  }, []);

  const clearAll = useCallback(() => {
    setHistory([]);
  }, []);

  const filteredHistory = useMemo(() => {
    if (!searchQuery.trim()) return history;
    const query = searchQuery.toLowerCase();
    return history.filter(
      (entry) =>
        entry.expression.toLowerCase().includes(query) ||
        entry.result.toLowerCase().includes(query),
    );
  }, [history, searchQuery]);

  return {
    history,
    filteredHistory,
    searchQuery,
    setSearchQuery,
    addEntry,
    deleteEntry,
    clearAll,
  };
}
