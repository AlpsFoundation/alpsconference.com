import { useCallback, useEffect, useRef, useState } from "react";
import type { BuildPhase } from "../data/crewBuild";
import type { BuildState } from "../lib/crewBuild";
import { withBase } from "../lib/withBase";

const POLL_MS = 15_000;
/** How long a "Not saved" message stays up. */
const SAVE_ERROR_MS = 10_000;

/**
 * `loading` until the first answer; `offline` while the build database cannot be reached,
 * which pauses sign-ups, ticks and adding names until a poll gets through again.
 */
export type CrewBuildStatus = "loading" | "online" | "offline";

export type CrewBuildApi = {
  state: BuildState | null;
  status: CrewBuildStatus;
  /** Last save problem, shown next to the build lists. */
  error: string | null;
  assign: (id: string, person: string, phase: BuildPhase, on: boolean) => Promise<void>;
  tick: (id: string, phase: BuildPhase, done: boolean, by: string | null) => Promise<void>;
  addPerson: (name: string) => Promise<string | null>;
};

/** The database answered that it is down (503), or the request never got through. */
class OfflineError extends Error {}

async function call(path: string, body?: unknown) {
  let response: Response;
  try {
    response = await fetch(withBase(`api/crew-build/${path}`), body
      ? { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify(body) }
      : { cache: "no-store" });
  } catch {
    throw new OfflineError("No connection.");
  }
  const data = (await response.json().catch(() => null)) as { error?: string } | null;
  if (!response.ok || !data) {
    const message = data?.error || `HTTP ${response.status}`;
    throw response.status >= 500 || !data ? new OfflineError(message) : new Error(message);
  }
  return data;
}

const messageOf = (err: unknown) => (err instanceof Error ? err.message : String(err));

/** Live build sign-ups and ticks: polled every 15 s, refreshed when the tab or the connection comes back. */
export function useCrewBuild(): CrewBuildApi {
  const [state, setState] = useState<BuildState | null>(null);
  const [status, setStatus] = useState<CrewBuildStatus>("loading");
  const [error, setError] = useState<string | null>(null);
  const pending = useRef(0);

  const refresh = useCallback(async () => {
    try {
      const next = (await call("state")) as unknown as BuildState;
      // A save in flight would be undone by an older read.
      if (!pending.current) setState(next);
      setStatus("online");
    } catch (err) {
      // Keep the last answer on screen; the page only pauses what needs the database.
      if (!(err instanceof OfflineError)) console.warn("crew build: unexpected answer", err);
      setStatus("offline");
    }
  }, []);

  useEffect(() => {
    refresh();
    const timer = window.setInterval(refresh, POLL_MS);
    const onVisible = () => {
      if (!document.hidden) refresh();
    };
    document.addEventListener("visibilitychange", onVisible);
    window.addEventListener("online", refresh);
    return () => {
      window.clearInterval(timer);
      document.removeEventListener("visibilitychange", onVisible);
      window.removeEventListener("online", refresh);
    };
  }, [refresh]);

  useEffect(() => {
    if (!error) return;
    const timer = window.setTimeout(() => setError(null), SAVE_ERROR_MS);
    return () => window.clearTimeout(timer);
  }, [error]);

  const failed = useCallback((err: unknown) => {
    if (err instanceof OfflineError) setStatus("offline");
    setError(`Not saved: ${messageOf(err)}`);
  }, []);

  const save = useCallback(
    async (path: string, body: unknown, optimistic: (prev: BuildState) => BuildState) => {
      pending.current += 1;
      setState((prev) => (prev ? optimistic(prev) : prev));
      try {
        await call(path, body);
        setError(null);
      } catch (err) {
        failed(err);
      } finally {
        pending.current -= 1;
        await refresh();
      }
    },
    [refresh, failed]
  );

  const assign = useCallback<CrewBuildApi["assign"]>(
    (id, person, phase, on) =>
      save("assign", { task_id: id, person, phase, on }, (prev) => ({
        ...prev,
        assignments: on
          ? [...prev.assignments, { task_id: id, person, phase }]
          : prev.assignments.filter((a) => !(a.task_id === id && a.person === person && a.phase === phase)),
      })),
    [save]
  );

  const tick = useCallback<CrewBuildApi["tick"]>(
    (id, phase, done, by) =>
      save("tick", { task_id: id, phase, done, by }, (prev) => ({
        ...prev,
        ticks: done
          ? [...prev.ticks.filter((t) => !(t.task_id === id && t.phase === phase)), { task_id: id, phase, by, done_at: new Date().toISOString().replace("T", " ").slice(0, 19) }]
          : prev.ticks.filter((t) => !(t.task_id === id && t.phase === phase)),
      })),
    [save]
  );

  const addPerson = useCallback<CrewBuildApi["addPerson"]>(
    async (name) => {
      try {
        const result = (await call("person", { name })) as { name?: string };
        await refresh();
        return result.name ?? null;
      } catch (err) {
        failed(err);
        return null;
      }
    },
    [refresh, failed]
  );

  return { state, status, error, assign, tick, addPerson };
}
