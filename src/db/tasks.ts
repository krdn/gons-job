import type { Database } from "bun:sqlite";
import { nowIso } from "../lib/now";

export type Status = "open" | "in_progress" | "done";

export interface TaskRow {
  id: number;
  text: string;
  status: Status;
  deadline: string | null;
  created_at: string;
  status_changed_at: string;
}

export interface NewTask {
  text: string;
  deadline: string | null;
}

export function insertTask(db: Database, t: NewTask): number {
  const ts = nowIso();
  const result = db
    .query(
      `INSERT INTO tasks(text, status, deadline, created_at, status_changed_at)
       VALUES (?, 'open', ?, ?, ?)`
    )
    .run(t.text, t.deadline, ts, ts);
  return Number(result.lastInsertRowid);
}

export function getTaskById(db: Database, id: number): TaskRow | null {
  const row = db
    .query<TaskRow, [number]>(
      "SELECT id, text, status, deadline, created_at, status_changed_at FROM tasks WHERE id = ?"
    )
    .get(id);
  return row ?? null;
}

export function setStatus(db: Database, id: number, status: Status): void {
  const ts = nowIso();
  const result = db
    .query("UPDATE tasks SET status = ?, status_changed_at = ? WHERE id = ?")
    .run(status, ts, id);
  if (result.changes === 0) {
    throw new Error(`존재하지 않는 task id: ${id}`);
  }
}

export function setDeadline(
  db: Database,
  id: number,
  deadline: string | null
): void {
  const result = db
    .query("UPDATE tasks SET deadline = ? WHERE id = ?")
    .run(deadline, id);
  if (result.changes === 0) {
    throw new Error(`존재하지 않는 task id: ${id}`);
  }
}

export function removeTask(db: Database, id: number): void {
  const result = db.query("DELETE FROM tasks WHERE id = ?").run(id);
  if (result.changes === 0) {
    throw new Error(`존재하지 않는 task id: ${id}`);
  }
}

// morning 정렬 규칙:
//   1) status='in_progress' DESC by status_changed_at
//   2) status='open'         DESC by created_at
//   3) status='done'은 제외
export function selectMorningTasks(db: Database): TaskRow[] {
  return db
    .query<TaskRow, []>(
      `SELECT id, text, status, deadline, created_at, status_changed_at
       FROM tasks
       WHERE status IN ('open','in_progress')
       ORDER BY
         CASE status WHEN 'in_progress' THEN 0 ELSE 1 END ASC,
         CASE status WHEN 'in_progress' THEN status_changed_at ELSE created_at END DESC`
    )
    .all();
}

export interface FilterArgs {
  status?: Status;
}

export function selectByFilter(db: Database, f: FilterArgs): TaskRow[] {
  if (f.status) {
    return db
      .query<TaskRow, [Status]>(
        `SELECT id, text, status, deadline, created_at, status_changed_at
         FROM tasks WHERE status = ? ORDER BY id DESC`
      )
      .all(f.status);
  }
  return db
    .query<TaskRow, []>(
      `SELECT id, text, status, deadline, created_at, status_changed_at
       FROM tasks ORDER BY id DESC`
    )
    .all();
}
