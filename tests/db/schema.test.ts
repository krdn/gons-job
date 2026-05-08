import { describe, expect, test, beforeEach } from "bun:test";
import { Database } from "bun:sqlite";
import { ensureSchema } from "../../src/db/schema";

describe("ensureSchema", () => {
  let db: Database;

  beforeEach(() => {
    db = new Database(":memory:");
  });

  test("creates tasks table with expected columns", () => {
    ensureSchema(db);
    const cols = db
      .query<{ name: string; type: string; notnull: number }, []>(
        "PRAGMA table_info(tasks)"
      )
      .all();
    const byName = Object.fromEntries(
      cols.map((c) => [c.name, c])
    ) as Record<string, { name: string; type: string; notnull: number }>;
    expect(byName.id).toBeDefined();
    expect(byName.text!.type).toBe("TEXT");
    expect(byName.text!.notnull).toBe(1);
    expect(byName.status!.type).toBe("TEXT");
    expect(byName.status!.notnull).toBe(1);
    expect(byName.deadline!.type).toBe("TEXT");
    expect(byName.deadline!.notnull).toBe(0);
    expect(byName.created_at!.notnull).toBe(1);
    expect(byName.status_changed_at!.notnull).toBe(1);
  });

  test("creates tags and task_tags tables", () => {
    ensureSchema(db);
    const tables = db
      .query<{ name: string }, []>(
        "SELECT name FROM sqlite_master WHERE type='table' ORDER BY name"
      )
      .all()
      .map((r) => r.name);
    expect(tables).toContain("tasks");
    expect(tables).toContain("tags");
    expect(tables).toContain("task_tags");
  });

  test("status check constraint rejects invalid values", () => {
    ensureSchema(db);
    expect(() =>
      db
        .query(
          "INSERT INTO tasks(text,status,created_at,status_changed_at) VALUES (?,?,?,?)"
        )
        .run("t", "wrong", "2026-05-08T00:00:00+09:00", "2026-05-08T00:00:00+09:00")
    ).toThrow();
  });

  test("creates expected indexes", () => {
    ensureSchema(db);
    const idx = db
      .query<{ name: string }, []>(
        "SELECT name FROM sqlite_master WHERE type='index' AND name LIKE 'idx_%'"
      )
      .all()
      .map((r) => r.name);
    expect(idx).toContain("idx_tasks_status");
    expect(idx).toContain("idx_tasks_status_changed");
  });

  test("ensureSchema is idempotent", () => {
    ensureSchema(db);
    expect(() => ensureSchema(db)).not.toThrow();
  });
});
