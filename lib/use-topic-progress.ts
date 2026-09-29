import { useCallback, useMemo, useSyncExternalStore } from "react";

const fallback = new Map<string, string>();
const eventName = "tekspyk-progress-change";
function subscribe(callback: () => void) {
  window.addEventListener("storage", callback);
  window.addEventListener(eventName, callback);
  return () => { window.removeEventListener("storage", callback); window.removeEventListener(eventName, callback); };
}
function read(key: string) {
  try { return localStorage.getItem(key) ?? fallback.get(key) ?? "[]"; }
  catch { return fallback.get(key) ?? "[]"; }
}
function parse(raw: string | null): Set<string> {
  try {
    const value: unknown = JSON.parse(raw ?? "[]");
    return new Set(Array.isArray(value) ? value.filter((item): item is string => typeof item === "string") : []);
  } catch { return new Set(); }
}

// Preview check marks are local conveniences. Enrolled lesson progress is stored on the server.
export function useTopicProgress(programKey: string) {
  const storageKey = `tekspyk_progress_${programKey}`;
  const raw = useSyncExternalStore(subscribe, () => read(storageKey), () => null);
  const completed = useMemo(() => parse(raw), [raw]);
  const toggle = useCallback((topicId: string) => {
    const next = parse(read(storageKey));
    if (next.has(topicId)) next.delete(topicId); else next.add(topicId);
    const value = JSON.stringify([...next]);
    fallback.set(storageKey, value);
    try { localStorage.setItem(storageKey, value); }
    catch { console.warn("Preview progress is available only for this browser session."); }
    window.dispatchEvent(new Event(eventName));
  }, [storageKey]);
  const isCompleted = useCallback((id: string) => completed.has(id), [completed]);
  return { completed, hydrated: raw !== null, toggle, isCompleted };
}
