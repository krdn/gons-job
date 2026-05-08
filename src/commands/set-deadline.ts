import type { Database } from "bun:sqlite";
import { setDeadline } from "../db/tasks";

export function runSetDeadline(
  db: Database,
  id: number,
  deadline: string | null
): void {
  setDeadline(db, id, deadline);
}
