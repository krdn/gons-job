import { describe, expect, test, beforeEach, afterEach } from "bun:test";
import { Database } from "bun:sqlite";
import { ensureSchema } from "../../src/db/schema";
import { runAdd } from "../../src/commands/add";
import { runDone } from "../../src/commands/done";
import { getTaskById } from "../../src/db/tasks";
import { setNowForTesting, resetNowForTesting } from "../../src/lib/now";

let db: Database;

beforeEach(() => {
  db = new Database(":memory:");
  ensureSchema(db);
  setNowForTesting(() => new Date("2026-05-08T03:00:00Z"));
});

afterEach(() => resetNowForTesting());

describe("runDone", () => {
  test("transitions task to done and bumps status_changed_at", () => {
    const id = runAdd(db, { textParts: ["x"], deadline: null });
    setNowForTesting(() => new Date("2026-05-08T05:00:00Z"));
    runDone(db, id);
    const row = getTaskById(db, id);
    expect(row!.status).toBe("done");
    expect(row!.status_changed_at).not.toBe(row!.created_at);
  });

  test("throws on unknown id", () => {
    expect(() => runDone(db, 9999)).toThrow();
  });
});
