import type { Database } from "bun:sqlite";
import { removeTask } from "../db/tasks";

export function runRm(db: Database, id: number): void {
  removeTask(db, id);
}
