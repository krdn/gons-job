import React, { useReducer, useEffect } from "react";
import { Box, Text, useApp, useInput } from "ink";
import { TaskList } from "./TaskList";
import {
  initialMorningState,
  morningReducer,
  type MorningState,
} from "./useMorning";
import type { TaskRow } from "../db/tasks";

interface Props {
  tasks: TaskRow[];
  tagsByTaskId: Map<number, string[]>;
  onFinish: (state: MorningState) => void;
}

export function App({ tasks, tagsByTaskId, onFinish }: Props) {
  const [state, dispatch] = useReducer(
    morningReducer,
    tasks,
    initialMorningState
  );
  const { exit } = useApp();

  useInput((input, key) => {
    if (state.phase !== "editing") return;
    if (input === "j" || key.downArrow) dispatch({ type: "MOVE_DOWN" });
    else if (input === "k" || key.upArrow) dispatch({ type: "MOVE_UP" });
    else if (input === " ") dispatch({ type: "TOGGLE" });
    else if (key.return) dispatch({ type: "COMMIT" });
    else if (input === "q") dispatch({ type: "CANCEL" });
  });

  useEffect(() => {
    if (state.phase === "committed" || state.phase === "cancelled" || state.phase === "empty") {
      onFinish(state);
      exit();
    }
  }, [state.phase]); // eslint-disable-line react-hooks/exhaustive-deps

  if (state.phase === "empty") {
    return <Text>아무 일도 없는 아침</Text>;
  }

  const today = new Date().toISOString().slice(0, 10);
  return (
    <Box flexDirection="column">
      <Text bold>gons-job morning — {today}</Text>
      <Text>{"=".repeat(50)}</Text>
      <Box marginY={1}>
        <TaskList
          tasks={state.tasks}
          cursor={state.cursor}
          toggled={state.toggled}
          tagsByTaskId={tagsByTaskId}
        />
      </Box>
      <Text dimColor>j/k 또는 ↑/↓ 이동  space 토글  enter 확정  q 취소</Text>
    </Box>
  );
}
