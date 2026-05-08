// 테스트에서 모킹할 수 있도록 함수로 export.
// production: KST(UTC+9) ISO 8601 문자열 반환.
let _now: () => Date = () => new Date();

export function setNowForTesting(fn: () => Date): void {
  _now = fn;
}

export function resetNowForTesting(): void {
  _now = () => new Date();
}

export function nowIso(): string {
  // KST offset 고정. SQLite는 TEXT로 저장.
  const d = _now();
  const kst = new Date(d.getTime() + 9 * 60 * 60 * 1000);
  return kst.toISOString().replace("Z", "+09:00");
}
