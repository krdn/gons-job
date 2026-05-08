import { describe, expect, test, beforeEach, afterEach } from "bun:test";
import { Database } from "bun:sqlite";
import { ensureSchema } from "../../src/db/schema";
import { runAdd } from "../../src/commands/add";
import { runRm } from "../../src/commands/rm";
import { getTaskById } from "../../src/db/tasks";
import { setNowForTesting, resetNowForTesting } from "../../src/lib/now";

let db: Database;
beforeEach(() => {
  db = new Database(":memory:");
  ensureSchema(db);
  setNowForTesting(() => new Date("2026-05-08T03:00:00Z"));
});
afterEach(() => resetNowForTesting());

describe("runRm", () => {
  test("removes task", () => {
    const id = runAdd(db, { textParts: ["x"], deadline: null });
    runRm(db, id);
    expect(getTaskById(db, id)).toBeNull();
  });

  test("throws on unknown id", () => {
    expect(() => runRm(db, 9999)).toThrow();
  });
});
