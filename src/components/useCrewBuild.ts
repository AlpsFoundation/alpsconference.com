import { useCallback, useEffect, useRef, useState } from "react";
import type { BuildPhase } from "../data/crewBuild";
import type { BuildState } from "../lib/crewBuild";
import { withBase } from "../lib/withBase";

const POLL_MS = 15_000;

export type CrewBuildApi = {
  state: BuildState | null;
  /** Last load or save problem, shown next to the build lists. */
  error: string | null;
  assign: (id: string, person: string, phase: BuildPhase, on: boolean) => Promise<void>;
  tick: (id: string, phase: BuildPhase, done: boolean, by: string | null) => Promise<void>;
  addPerson: (name: string) => Promise<string | null>;
};

async function call(path: string, body?: unknown) {
  const response = await fetch(withBase(`api/crew-build/${path}`), body
    ? { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify(body) }
    : { cache: "no-store" });
  const data = (await response.json().catch(() => ({}))) as { error?: string };
  if (!response.ok) throw new Error(data.error || `HTTP ${response.status}`);
  return data;
}

/** Live build sign-ups and ticks: polled every 15 s, refreshed when the tab comes back. */
export function useCrewBuild(): CrewBuildApi {
  const [state, setState] = useState<BuildState | null>(null);
  const [error, setError] = useState<string | null>(null);
  const pending = useRef(0);

  const refresh = useCallback(async () => {
    try {
      const next = (await call("state")) as unknown as BuildState;
      // A save in flight would be undone by an older read.
      if (!pending.current) setState(next);
      setError(null);
    } catch (err) {
      setError(`Offline: ${err instanceof Error ? err.message : String(err)}`);
    }
  }, []);

  useEffect(() => {
    refresh();
    const timer = window.setInterval(refresh, POLL_MS);
    const onVisible = () => {
      if (!document.hidden) refresh();
    };
    document.addEventListener("visibilitychange", onVisible);
    return () => {
      window.clearInterval(timer);
      document.removeEventListener("visibilitychange", onVisible);
    };
  }, [refresh]);

  const save = useCallback(
    async (path: string, body: unknown, optimistic: (prev: BuildState) => BuildState) => {
      pending.current += 1;
      setState((prev) => (prev ? optimistic(prev) : prev));
      try {
        await call(path, body);
        setError(null);
      } catch (err) {
        setError(`Not saved: ${err instanceof Error ? err.message : String(err)}`);
      } finally {
        pending.current -= 1;
        await refresh();
      }
    },
    [refresh]
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
        setError(`Not saved: ${err instanceof Error ? err.message : String(err)}`);
        return null;
      }
    },
    [refresh]
  );

  return { state, error, assign, tick, addPerson };
}
