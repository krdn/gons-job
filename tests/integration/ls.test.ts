import { describe, expect, test, beforeEach, afterEach } from "bun:test";
import { Database } from "bun:sqlite";
import { ensureSchema } from "../../src/db/schema";
import { runAdd } from "../../src/commands/add";
import { runLs } from "../../src/commands/ls";
import { setNowForTesting, resetNowForTesting } from "../../src/lib/now";

let db: Database;

beforeEach(() => {
  db = new Database(":memory:");
  ensureSchema(db);
  setNowForTesting(() => new Date("2026-05-08T03:00:00Z"));
});

afterEach(() => resetNowForTesting());

describe("runLs", () => {
  test("returns formatted lines for all tasks", () => {
    runAdd(db, { textParts: ["A"], deadline: null });
    runAdd(db, { textParts: ["B", "#x"], deadline: "2026-05-20" });
    const lines = runLs(db, {});
    expect(lines.length).toBe(2);
    expect(lines.some((l) => l.includes("A"))).toBe(true);
    expect(lines.some((l) => l.includes("B"))).toBe(true);
    expect(lines.some((l) => l.includes("#x"))).toBe(true);
    expect(lines.some((l) => l.includes("2026-05-20"))).toBe(true);
  });

  test("filter by status", () => {
    runAdd(db, { textParts: ["A"], deadline: null });
    runAdd(db, { textParts: ["B"], deadline: null });
    const lines = runLs(db, { status: "open" });
    expect(lines.length).toBe(2);
    expect(runLs(db, { status: "in_progress" }).length).toBe(0);
  });

  test("filter by tag", () => {
    runAdd(db, { textParts: ["#x", "alpha"], deadline: null });
    runAdd(db, { textParts: ["#y", "beta"], deadline: null });
    const lines = runLs(db, { tag: "x" });
    expect(lines.length).toBe(1);
    expect(lines[0]!.includes("alpha")).toBe(true);
  });

  test("returns empty array when no tasks match", () => {
    expect(runLs(db, {})).toEqual([]);
  });
});
