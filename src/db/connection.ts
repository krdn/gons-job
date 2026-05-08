import { Database } from "bun:sqlite";
import { mkdirSync } from "node:fs";
import { homedir } from "node:os";
import { dirname, join } from "node:path";
import { ensureSchema } from "./schema";

export function dbPath(): string {
  return process.env.GONS_JOB_DB ?? join(homedir(), ".gons-job", "tasks.db");
}

export function openDb(path: string = dbPath()): Database {
  mkdirSync(dirname(path), { recursive: true });
  const db = new Database(path);
  ensureSchema(db);
  return db;
}
