import React from "react";
import { render } from "ink";
import { openDb } from "../db/connection";
import { selectMorningTasks, setStatus } from "../db/tasks";
import { tagsForTask } from "../db/tags";
import { App } from "./App";
import type { MorningState } from "./useMorning";

export async function runMorning(): Promise<void> {
  const db = openDb();
  try {
    const tasks = selectMorningTasks(db);

    // 빈 DB 케이스: ink raw mode 불필요, 즉시 출력 후 종료
    if (tasks.length === 0) {
      console.log("아무 일도 없는 아침");
      return;
    }

    const tagsByTaskId = new Map<number, string[]>();
    for (const t of tasks) tagsByTaskId.set(t.id, tagsForTask(db, t.id));

    await new Promise<void>((resolve) => {
      const onFinish = (state: MorningState) => {
        if (state.phase === "committed") {
          for (const tr of state.transitions) {
            setStatus(db, tr.id, tr.to);
          }
        }
        resolve();
      };
      const { waitUntilExit } = render(
        React.createElement(App, { tasks, tagsByTaskId, onFinish })
      );
      waitUntilExit().then(() => resolve());
    });
  } finally {
    db.close();
  }
}
