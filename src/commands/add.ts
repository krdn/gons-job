import type { Database } from "bun:sqlite";
import { insertTask } from "../db/tasks";
import { linkTagToTask, upsertTag } from "../db/tags";
import { parseTags } from "../lib/parse-tags";

export interface AddArgs {
  textParts: string[];
  deadline: string | null;
}

export function runAdd(db: Database, args: AddArgs): number {
  if (args.textParts.length === 0) {
    throw new Error("text가 비어 있습니다 (`job add <text>`)");
  }
  const text = args.textParts.join(" ");
  const id = insertTask(db, { text, deadline: args.deadline });
  for (const tag of parseTags(text)) {
    linkTagToTask(db, id, upsertTag(db, tag));
  }
  return id;
}
