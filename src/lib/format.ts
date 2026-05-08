import type { TaskRow } from "../db/tasks";

export function formatTaskLine(t: TaskRow, tags: string[]): string {
  const tagStr = tags.length ? "  " + tags.map((s) => `#${s}`).join(" ") : "";
  const dl = t.deadline ? `  (deadline: ${t.deadline})` : "";
  const status = `[${t.status}]`.padEnd(15);
  return `#${t.id}  ${status}  ${t.text}${tagStr}${dl}`;
}
