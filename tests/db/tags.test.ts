import { describe, expect, test, beforeEach } from "bun:test";
import { Database } from "bun:sqlite";
import { ensureSchema } from "../../src/db/schema";
import { insertTask } from "../../src/db/tasks";
import {
  upsertTag,
  linkTagToTask,
  unlinkTagFromTask,
  tagsForTask,
  taskIdsForTag,
} from "../../src/db/tags";

let db: Database;

beforeEach(() => {
  db = new Database(":memory:");
  ensureSchema(db);
});

describe("upsertTag", () => {
  test("creates tag and returns id", () => {
    const id = upsertTag(db, "design");
    expect(id).toBeGreaterThan(0);
  });

  test("returns same id for existing tag", () => {
    const a = upsertTag(db, "design");
    const b = upsertTag(db, "design");
    expect(a).toBe(b);
  });
});

describe("linkTagToTask / unlinkTagFromTask / tagsForTask", () => {
  test("links and lists tags for a task", () => {
    const taskId = insertTask(db, { text: "x", deadline: null });
    linkTagToTask(db, taskId, upsertTag(db, "a"));
    linkTagToTask(db, taskId, upsertTag(db, "b"));
    expect(tagsForTask(db, taskId).sort()).toEqual(["a", "b"]);
  });

  test("link is idempotent", () => {
    const taskId = insertTask(db, { text: "x", deadline: null });
    const tagId = upsertTag(db, "a");
    linkTagToTask(db, taskId, tagId);
    linkTagToTask(db, taskId, tagId);
    expect(tagsForTask(db, taskId)).toEqual(["a"]);
  });

  test("unlink removes the link only", () => {
    const taskId = insertTask(db, { text: "x", deadline: null });
    const tagId = upsertTag(db, "a");
    linkTagToTask(db, taskId, tagId);
    unlinkTagFromTask(db, taskId, tagId);
    expect(tagsForTask(db, taskId)).toEqual([]);
    // tag row 자체는 보존
    expect(upsertTag(db, "a")).toBe(tagId);
  });
});

describe("taskIdsForTag", () => {
  test("returns task ids for a given tag name", () => {
    const t1 = insertTask(db, { text: "a", deadline: null });
    const t2 = insertTask(db, { text: "b", deadline: null });
    linkTagToTask(db, t1, upsertTag(db, "x"));
    linkTagToTask(db, t2, upsertTag(db, "x"));
    expect(taskIdsForTag(db, "x").sort((a, b) => a - b)).toEqual([t1, t2]);
  });

  test("returns empty when tag not exist", () => {
    expect(taskIdsForTag(db, "ghost")).toEqual([]);
  });
});
