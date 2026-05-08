import { describe, expect, test } from "bun:test";
import {
  morningReducer,
  initialMorningState,
  type MorningState,
  type MorningAction,
} from "../../src/morning/useMorning";
import type { TaskRow } from "../../src/db/tasks";

const T = (id: number, status: TaskRow["status"]): TaskRow => ({
  id,
  text: `t${id}`,
  status,
  deadline: null,
  created_at: "2026-05-08T12:00:00+09:00",
  status_changed_at: "2026-05-08T12:00:00+09:00",
});

describe("morningReducer", () => {
  const tasks = [T(10, "in_progress"), T(20, "open"), T(30, "open")];
  const init = initialMorningState(tasks);

  test("initialMorningState selects the first row", () => {
    expect(init.cursor).toBe(0);
    expect(init.toggled.size).toBe(0);
    expect(init.phase).toBe("editing");
  });

  test("MOVE_DOWN/UP cycles cursor within bounds", () => {
    let s: MorningState = init;
    s = morningReducer(s, { type: "MOVE_DOWN" });
    expect(s.cursor).toBe(1);
    s = morningReducer(s, { type: "MOVE_DOWN" });
    s = morningReducer(s, { type: "MOVE_DOWN" });
    expect(s.cursor).toBe(2); // 끝에서 멈춤
    s = morningReducer(s, { type: "MOVE_UP" });
    expect(s.cursor).toBe(1);
    s = morningReducer(s, { type: "MOVE_UP" });
    s = morningReducer(s, { type: "MOVE_UP" });
    expect(s.cursor).toBe(0); // 0에서 멈춤
  });

  test("TOGGLE adds/removes id at cursor", () => {
    let s = init;
    s = morningReducer(s, { type: "TOGGLE" });
    expect(s.toggled.has(10)).toBe(true);
    s = morningReducer(s, { type: "TOGGLE" });
    expect(s.toggled.has(10)).toBe(false);
  });

  test("COMMIT transitions phase and reports decisions", () => {
    let s = init;
    // toggle id 10 (현재 in_progress) → open으로 빠질 예정
    s = morningReducer(s, { type: "TOGGLE" });
    // 커서 → 1 (id 20, open) 토글 → in_progress로 들어감
    s = morningReducer(s, { type: "MOVE_DOWN" });
    s = morningReducer(s, { type: "TOGGLE" });
    s = morningReducer(s, { type: "COMMIT" });
    expect(s.phase).toBe("committed");
    expect(s.transitions).toEqual([
      { id: 10, to: "open" }, // in_progress → open (빠지기)
      { id: 20, to: "in_progress" }, // open → in_progress (들어가기)
    ]);
  });

  test("CANCEL transitions phase to cancelled with no transitions", () => {
    let s = init;
    s = morningReducer(s, { type: "TOGGLE" });
    s = morningReducer(s, { type: "CANCEL" });
    expect(s.phase).toBe("cancelled");
    expect(s.transitions).toEqual([]);
  });

  test("empty task list -> phase is empty immediately", () => {
    const empty = initialMorningState([]);
    expect(empty.phase).toBe("empty");
  });
});
