import type { Database } from "bun:sqlite";
import { setStatus } from "../db/tasks";

export function runDone(db: Database, id: number): void {
  setStatus(db, id, "done");
}
