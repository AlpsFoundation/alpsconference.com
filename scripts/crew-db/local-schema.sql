-- Local copy of the build crew tables in the `conf26-setup` D1 database (binding CREW_DB),
-- for `pnpm dev` only: `pnpm db:crew:local`. Safe to run again.
--
-- The real migrations live in AlpsFoundation/tools.alps.foundation,
-- packages/conf26-setup/migrations (0001_init.sql, 0002_four_phases.sql). This is
-- their end state for the three tables /volunteers reads and writes; the tasks
-- come from src/data/crewBuild.ts, not from the database.

CREATE TABLE IF NOT EXISTS people (
  name TEXT PRIMARY KEY,
  source TEXT NOT NULL DEFAULT 'seed',
  created_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS assignments (
  task_id TEXT NOT NULL,
  person TEXT NOT NULL,
  phase TEXT NOT NULL CHECK (phase IN ('unload', 'setup', 'teardown', 'load')),
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  PRIMARY KEY (task_id, person, phase)
);

CREATE TABLE IF NOT EXISTS ticks (
  task_id TEXT NOT NULL,
  phase TEXT NOT NULL CHECK (phase IN ('unload', 'setup', 'teardown', 'load')),
  done_at TEXT NOT NULL DEFAULT (datetime('now')),
  by TEXT,
  PRIMARY KEY (task_id, phase)
);
