import { describe, expect, test, beforeEach, afterEach } from "bun:test";
import { Database } from "bun:sqlite";
import { ensureSchema } from "../../src/db/schema";
import {
  insertTask,
  getTaskById,
  setStatus,
  setDeadline,
  removeTask,
  selectMorningTasks,
  selectByFilter,
} from "../../src/db/tasks";
import { resetNowForTesting, setNowForTesting } from "../../src/lib/now";

let db: Database;

beforeEach(() => {
  db = new Database(":memory:");
  ensureSchema(db);
  setNowForTesting(() => new Date("2026-05-08T03:00:00Z")); // KST 12:00
});

afterEach(() => resetNowForTesting());

describe("insertTask", () => {
  test("inserts open task with same created_at and status_changed_at", () => {
    const id = insertTask(db, { text: "buy milk", deadline: null });
    const row = getTaskById(db, id);
    expect(row).not.toBeNull();
    expect(row!.text).toBe("buy milk");
    expect(row!.status).toBe("open");
    expect(row!.deadline).toBeNull();
    expect(row!.created_at).toBe(row!.status_changed_at);
  });

  test("inserts with deadline", () => {
    const id = insertTask(db, { text: "send report", deadline: "2026-05-20" });
    const row = getTaskById(db, id);
    expect(row!.deadline).toBe("2026-05-20");
  });
});

describe("setStatus", () => {
  test("updates status and bumps status_changed_at", () => {
    const id = insertTask(db, { text: "x", deadline: null });
    setNowForTesting(() => new Date("2026-05-08T05:00:00Z"));
    setStatus(db, id, "in_progress");
    const row = getTaskById(db, id);
    expect(row!.status).toBe("in_progress");
    expect(row!.status_changed_at).not.toBe(row!.created_at);
  });

  test("throws on unknown id", () => {
    expect(() => setStatus(db, 999, "done")).toThrow();
  });
});

describe("setDeadline", () => {
  test("sets and clears deadline", () => {
    const id = insertTask(db, { text: "x", deadline: null });
    setDeadline(db, id, "2026-06-01");
    expect(getTaskById(db, id)!.deadline).toBe("2026-06-01");
    setDeadline(db, id, null);
    expect(getTaskById(db, id)!.deadline).toBeNull();
  });
});

describe("removeTask", () => {
  test("removes task and cascades task_tags", () => {
    const id = insertTask(db, { text: "x", deadline: null });
    db.query("INSERT INTO tags(name) VALUES (?)").run("a");
    const tagId = (db.query("SELECT id FROM tags WHERE name=?").get("a") as { id: number }).id;
    db.query("INSERT INTO task_tags(task_id,tag_id) VALUES (?,?)").run(id, tagId);
    removeTask(db, id);
    expect(getTaskById(db, id)).toBeNull();
    const links = db.query("SELECT * FROM task_tags WHERE task_id=?").all(id);
    expect(links.length).toBe(0);
  });
});

describe("selectMorningTasks ordering", () => {
  test("in_progress first by status_changed_at DESC, then open by created_at DESC, no done", () => {
    setNowForTesting(() => new Date("2026-05-07T00:00:00Z"));
    const a = insertTask(db, { text: "A old open", deadline: null });

    setNowForTesting(() => new Date("2026-05-08T00:00:00Z"));
    const b = insertTask(db, { text: "B newer open", deadline: null });

    setNowForTesting(() => new Date("2026-05-08T01:00:00Z"));
    const c = insertTask(db, { text: "C in_progress old", deadline: null });
    setStatus(db, c, "in_progress");

    setNowForTesting(() => new Date("2026-05-08T02:00:00Z"));
    const d = insertTask(db, { text: "D in_progress new", deadline: null });
    setStatus(db, d, "in_progress");

    setNowForTesting(() => new Date("2026-05-08T03:00:00Z"));
    const e = insertTask(db, { text: "E done", deadline: null });
    setStatus(db, e, "done");

    const rows = selectMorningTasks(db);
    const ids = rows.map((r) => r.id);
    expect(ids).toEqual([d, c, b, a]);
  });

  test("returns empty array when DB has no open/in_progress tasks", () => {
    const id = insertTask(db, { text: "x", deadline: null });
    setStatus(db, id, "done");
    expect(selectMorningTasks(db)).toEqual([]);
  });
});

describe("selectByFilter", () => {
  test("filters by status", () => {
    const a = insertTask(db, { text: "A", deadline: null });
    const b = insertTask(db, { text: "B", deadline: null });
    setStatus(db, b, "in_progress");
    expect(selectByFilter(db, { status: "open" }).map((r) => r.id)).toEqual([a]);
    expect(selectByFilter(db, { status: "in_progress" }).map((r) => r.id)).toEqual([b]);
  });

  test("returns all when no filter", () => {
    insertTask(db, { text: "A", deadline: null });
    insertTask(db, { text: "B", deadline: null });
    expect(selectByFilter(db, {}).length).toBe(2);
  });
});
