import { readdirSync, readFileSync } from "node:fs";
import { DatabaseSync } from "node:sqlite";

/** Just enough of D1 for the signup queries, on in-memory SQLite with the real migrations. */
export function fakeD1(): D1Database {
  const db = new DatabaseSync(":memory:");
  const migrations = new URL("../../migrations/", import.meta.url);
  for (const file of readdirSync(migrations).sort()) {
    db.exec(readFileSync(new URL(file, migrations), "utf8"));
  }
  return {
    prepare(sql: string) {
      const statement = db.prepare(sql);
      let args: never[] = [];
      const bound = {
        bind(...values: never[]) {
          args = values;
          return bound;
        },
        first: async () => statement.get(...args) ?? null,
        all: async () => ({ results: statement.all(...args) }),
        run: async () => ({ meta: { changes: Number(statement.run(...args).changes) } }),
      };
      return bound;
    },
  } as unknown as D1Database;
}
