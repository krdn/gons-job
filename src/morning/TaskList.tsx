import React from "react";
import { Box, Text } from "ink";
import type { TaskRow } from "../db/tasks";

interface Props {
  tasks: TaskRow[];
  cursor: number;
  toggled: Set<number>;
  tagsByTaskId: Map<number, string[]>;
}

export function TaskList({ tasks, cursor, toggled, tagsByTaskId }: Props) {
  return (
    <Box flexDirection="column">
      {tasks.map((t, i) => {
        const isCursor = i === cursor;
        const isToggled = toggled.has(t.id);
        const mark = isToggled ? "[*]" : "[ ]";
        const tags = (tagsByTaskId.get(t.id) ?? []).map((s) => `#${s}`).join(" ");
        const dl = t.deadline ? `  (deadline: ${t.deadline})` : "";
        const statusLabel = t.status === "in_progress" ? "in_progress" : "";
        const line = `${mark} ${String(t.id).padStart(3)}  ${t.text}  ${tags}${dl}  ${statusLabel}`;
        return (
          <Text key={t.id} inverse={isCursor} color={isToggled ? "cyan" : undefined}>
            {line}
          </Text>
        );
      })}
    </Box>
  );
}
