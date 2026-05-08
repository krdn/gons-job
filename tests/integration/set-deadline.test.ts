import { describe, expect, test, beforeEach, afterEach } from "bun:test";
import { Database } from "bun:sqlite";
import { ensureSchema } from "../../src/db/schema";
import { runAdd } from "../../src/commands/add";
import { runSetDeadline } from "../../src/commands/set-deadline";
import { getTaskById } from "../../src/db/tasks";
import { setNowForTesting, resetNowForTesting } from "../../src/lib/now";

let db: Database;
beforeEach(() => {
  db = new Database(":memory:");
  ensureSchema(db);
  setNowForTesting(() => new Date("2026-05-08T03:00:00Z"));
});
afterEach(() => resetNowForTesting());

describe("runSetDeadline", () => {
  test("sets deadline", () => {
    const id = runAdd(db, { textParts: ["x"], deadline: null });
    runSetDeadline(db, id, "2026-05-20");
    expect(getTaskById(db, id)!.deadline).toBe("2026-05-20");
  });

  test("clears deadline when null", () => {
    const id = runAdd(db, { textParts: ["x"], deadline: "2026-05-20" });
    runSetDeadline(db, id, null);
    expect(getTaskById(db, id)!.deadline).toBeNull();
  });

  test("throws on unknown id", () => {
    expect(() => runSetDeadline(db, 9999, "2026-05-20")).toThrow();
  });
});
