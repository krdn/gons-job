import { nowIso } from "./now";

const ISO_RE = /^\d{4}-\d{2}-\d{2}$/;
const REL_RE = /^\+(\d+)([dw])$/;

export function parseDate(input: string): string {
  if (ISO_RE.test(input)) return input;

  if (input === "tomorrow") return addDays(todayKst(), 1);

  const m = REL_RE.exec(input);
  if (m) {
    const n = Number(m[1]);
    const unit = m[2];
    const days = unit === "w" ? n * 7 : n;
    return addDays(todayKst(), days);
  }

  throw new Error(`알 수 없는 날짜 표기: ${input}`);
}

function todayKst(): string {
  // nowIso()는 "YYYY-MM-DDTHH:mm:ss+09:00" 형식
  return nowIso().slice(0, 10);
}

function addDays(yyyymmdd: string, days: number): string {
  const [y, m, d] = yyyymmdd.split("-").map(Number);
  const dt = new Date(Date.UTC(y!, m! - 1, d!));
  dt.setUTCDate(dt.getUTCDate() + days);
  const yy = dt.getUTCFullYear();
  const mm = String(dt.getUTCMonth() + 1).padStart(2, "0");
  const dd = String(dt.getUTCDate()).padStart(2, "0");
  return `${yy}-${mm}-${dd}`;
}
