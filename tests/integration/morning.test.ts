import { describe, expect, test, beforeEach, afterEach } from "bun:test";
import { Database } from "bun:sqlite";
import { ensureSchema } from "../../src/db/schema";
import { runAdd } from "../../src/commands/add";
import { runDone } from "../../src/commands/done";
import { selectMorningTasks, setStatus } from "../../src/db/tasks";
import { initialMorningState } from "../../src/morning/useMorning";
import { setNowForTesting, resetNowForTesting } from "../../src/lib/now";

let db: Database;

beforeEach(() => {
  db = new Database(":memory:");
  ensureSchema(db);
});

afterEach(() => resetNowForTesting());

describe("morning selection + initial state", () => {
  test("done은 화면에 안 보이고, in_progress가 위, open이 아래", () => {
    setNowForTesting(() => new Date("2026-05-07T00:00:00Z"));
    const a = runAdd(db, { textParts: ["오래된 open"], deadline: null });

    setNowForTesting(() => new Date("2026-05-08T00:00:00Z"));
    const b = runAdd(db, { textParts: ["새 open"], deadline: null });

    setNowForTesting(() => new Date("2026-05-08T01:00:00Z"));
    const c = runAdd(db, { textParts: ["진행중 1"], deadline: null });
    setStatus(db, c, "in_progress");

    setNowForTesting(() => new Date("2026-05-08T02:00:00Z"));
    const d = runAdd(db, { textParts: ["진행중 2"], deadline: null });
    setStatus(db, d, "in_progress");

    setNowForTesting(() => new Date("2026-05-08T03:00:00Z"));
    const e = runAdd(db, { textParts: ["완료"], deadline: null });
    runDone(db, e);

    const tasks = selectMorningTasks(db);
    expect(tasks.map((t) => t.id)).toEqual([d, c, b, a]);
    const init = initialMorningState(tasks);
    expect(init.phase).toBe("editing");
    expect(init.cursor).toBe(0);
  });

  test("일반 빈 DB에서는 phase=empty", () => {
    const tasks = selectMorningTasks(db);
    expect(initialMorningState(tasks).phase).toBe("empty");
  });
});
