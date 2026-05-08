import type { TaskRow, Status } from "../db/tasks";

export type MorningPhase = "editing" | "committed" | "cancelled" | "empty";

export interface Transition {
  id: number;
  to: Status; // 'in_progress' or 'open'
}

export interface MorningState {
  tasks: TaskRow[];
  cursor: number;
  toggled: Set<number>;
  phase: MorningPhase;
  transitions: Transition[];
}

export type MorningAction =
  | { type: "MOVE_UP" }
  | { type: "MOVE_DOWN" }
  | { type: "TOGGLE" }
  | { type: "COMMIT" }
  | { type: "CANCEL" };

export function initialMorningState(tasks: TaskRow[]): MorningState {
  return {
    tasks,
    cursor: 0,
    toggled: new Set(),
    phase: tasks.length === 0 ? "empty" : "editing",
    transitions: [],
  };
}

export function morningReducer(
  state: MorningState,
  action: MorningAction
): MorningState {
  if (state.phase !== "editing") return state;

  switch (action.type) {
    case "MOVE_UP":
      return { ...state, cursor: Math.max(0, state.cursor - 1) };
    case "MOVE_DOWN":
      return {
        ...state,
        cursor: Math.min(state.tasks.length - 1, state.cursor + 1),
      };
    case "TOGGLE": {
      const t = state.tasks[state.cursor];
      if (!t) return state;
      const next = new Set(state.toggled);
      if (next.has(t.id)) next.delete(t.id);
      else next.add(t.id);
      return { ...state, toggled: next };
    }
    case "COMMIT": {
      // 토글된 task만 status 전이.
      // - in_progress → open  (빠지기)
      // - open        → in_progress (들어가기)
      // 토글 안 된 task는 status 그대로 유지 (yesterday in_progress가 자연스럽게 이어짐).
      const transitions: Transition[] = [];
      for (const t of state.tasks) {
        if (!state.toggled.has(t.id)) continue;
        if (t.status === "in_progress") {
          transitions.push({ id: t.id, to: "open" });
        } else if (t.status === "open") {
          transitions.push({ id: t.id, to: "in_progress" });
        }
      }
      return { ...state, phase: "committed", transitions };
    }
    case "CANCEL":
      return { ...state, phase: "cancelled", transitions: [] };
  }
}
