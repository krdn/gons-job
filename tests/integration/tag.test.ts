import { describe, expect, test, beforeEach, afterEach } from "bun:test";
import { Database } from "bun:sqlite";
import { ensureSchema } from "../../src/db/schema";
import { runAdd } from "../../src/commands/add";
import { runTag } from "../../src/commands/tag";
import { tagsForTask } from "../../src/db/tags";
import { setNowForTesting, resetNowForTesting } from "../../src/lib/now";

let db: Database;
beforeEach(() => {
  db = new Database(":memory:");
  ensureSchema(db);
  setNowForTesting(() => new Date("2026-05-08T03:00:00Z"));
});
afterEach(() => resetNowForTesting());

describe("runTag (toggle)", () => {
  test("adds tag if missing", () => {
    const id = runAdd(db, { textParts: ["x"], deadline: null });
    runTag(db, id, "newtag");
    expect(tagsForTask(db, id)).toContain("newtag");
  });

  test("removes tag if present", () => {
    const id = runAdd(db, { textParts: ["#existing", "x"], deadline: null });
    runTag(db, id, "existing");
    expect(tagsForTask(db, id)).not.toContain("existing");
  });

  test("throws on unknown task id", () => {
    expect(() => runTag(db, 9999, "x")).toThrow();
  });
});
