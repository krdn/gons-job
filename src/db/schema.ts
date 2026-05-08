import type { Database } from "bun:sqlite";

const DDL = `
CREATE TABLE IF NOT EXISTS tasks (
  id                INTEGER PRIMARY KEY AUTOINCREMENT,
  text              TEXT NOT NULL,
  status            TEXT NOT NULL CHECK(status IN ('open','in_progress','done')),
  deadline          TEXT,
  created_at        TEXT NOT NULL,
  status_changed_at TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS tags (
  id    INTEGER PRIMARY KEY AUTOINCREMENT,
  name  TEXT NOT NULL UNIQUE
);

CREATE TABLE IF NOT EXISTS task_tags (
  task_id INTEGER NOT NULL,
  tag_id  INTEGER NOT NULL,
  PRIMARY KEY (task_id, tag_id),
  FOREIGN KEY (task_id) REFERENCES tasks(id) ON DELETE CASCADE,
  FOREIGN KEY (tag_id)  REFERENCES tags(id)  ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_tasks_status ON tasks(status);
CREATE INDEX IF NOT EXISTS idx_tasks_status_changed ON tasks(status_changed_at);
`;

export function ensureSchema(db: Database): void {
  db.exec("PRAGMA foreign_keys = ON;");
  db.exec(DDL);
}
