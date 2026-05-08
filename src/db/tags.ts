import type { Database } from "bun:sqlite";

export function upsertTag(db: Database, name: string): number {
  const existing = db
    .query<{ id: number }, [string]>("SELECT id FROM tags WHERE name = ?")
    .get(name);
  if (existing) return existing.id;
  const result = db.query("INSERT INTO tags(name) VALUES (?)").run(name);
  return Number(result.lastInsertRowid);
}

export function linkTagToTask(
  db: Database,
  taskId: number,
  tagId: number
): void {
  db.query(
    "INSERT OR IGNORE INTO task_tags(task_id, tag_id) VALUES (?, ?)"
  ).run(taskId, tagId);
}

export function unlinkTagFromTask(
  db: Database,
  taskId: number,
  tagId: number
): void {
  db.query("DELETE FROM task_tags WHERE task_id = ? AND tag_id = ?").run(
    taskId,
    tagId
  );
}

export function tagsForTask(db: Database, taskId: number): string[] {
  return db
    .query<{ name: string }, [number]>(
      `SELECT t.name FROM tags t
       JOIN task_tags tt ON tt.tag_id = t.id
       WHERE tt.task_id = ?
       ORDER BY t.name ASC`
    )
    .all(taskId)
    .map((r) => r.name);
}

export function taskIdsForTag(db: Database, name: string): number[] {
  return db
    .query<{ task_id: number }, [string]>(
      `SELECT tt.task_id FROM task_tags tt
       JOIN tags t ON tt.tag_id = t.id
       WHERE t.name = ?`
    )
    .all(name)
    .map((r) => r.task_id);
}
