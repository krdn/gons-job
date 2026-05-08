import type { Database } from "bun:sqlite";
import { getTaskById } from "../db/tasks";
import {
  linkTagToTask,
  tagsForTask,
  unlinkTagFromTask,
  upsertTag,
} from "../db/tags";

export function runTag(db: Database, taskId: number, name: string): void {
  if (!getTaskById(db, taskId)) {
    throw new Error(`존재하지 않는 task id: ${taskId}`);
  }
  const tagId = upsertTag(db, name);
  if (tagsForTask(db, taskId).includes(name)) {
    unlinkTagFromTask(db, taskId, tagId);
  } else {
    linkTagToTask(db, taskId, tagId);
  }
}
