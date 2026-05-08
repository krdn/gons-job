import type { Database } from "bun:sqlite";
import type { Status } from "../db/tasks";
import { selectByFilter } from "../db/tasks";
import { tagsForTask, taskIdsForTag } from "../db/tags";
import { formatTaskLine } from "../lib/format";

export interface LsArgs {
  status?: Status;
  tag?: string;
}

export function runLs(db: Database, args: LsArgs): string[] {
  let rows = selectByFilter(db, { status: args.status });

  if (args.tag) {
    const ids = new Set(taskIdsForTag(db, args.tag));
    rows = rows.filter((r) => ids.has(r.id));
  }

  return rows.map((r) => formatTaskLine(r, tagsForTask(db, r.id)));
}
