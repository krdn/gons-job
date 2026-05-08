import { describe, expect, test, beforeEach, afterEach } from "bun:test";
import { Database } from "bun:sqlite";
import { ensureSchema } from "../../src/db/schema";
import { runAdd } from "../../src/commands/add";
import { selectByFilter } from "../../src/db/tasks";
import { tagsForTask } from "../../src/db/tags";
import { resetNowForTesting, setNowForTesting } from "../../src/lib/now";

let db: Database;

beforeEach(() => {
  db = new Database(":memory:");
  ensureSchema(db);
  setNowForTesting(() => new Date("2026-05-08T03:00:00Z"));
});

afterEach(() => resetNowForTesting());

describe("runAdd", () => {
  test("creates open task with given text", () => {
    const id = runAdd(db, { textParts: ["buy", "milk"], deadline: null });
    const rows = selectByFilter(db, {});
    expect(rows.length).toBe(1);
    expect(rows[0]!.id).toBe(id);
    expect(rows[0]!.text).toBe("buy milk");
    expect(rows[0]!.status).toBe("open");
  });

  test("extracts and links tags from text", () => {
    const id = runAdd(db, {
      textParts: ["#design", "도메인", "그림", "#urgent"],
      deadline: null,
    });
    expect(tagsForTask(db, id).sort()).toEqual(["design", "urgent"]);
    // text는 원형 보존
    expect(selectByFilter(db, {})[0]!.text).toBe("#design 도메인 그림 #urgent");
  });

  test("zero positional args throws", () => {
    expect(() => runAdd(db, { textParts: [], deadline: null })).toThrow();
  });

  test("deadline is stored", () => {
    const id = runAdd(db, {
      textParts: ["report"],
      deadline: "2026-05-20",
    });
    expect(selectByFilter(db, {})[0]!.deadline).toBe("2026-05-20");
  });
});
