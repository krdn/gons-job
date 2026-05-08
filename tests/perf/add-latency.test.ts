// 이 테스트는 CI가 아니라 로컬 회귀 검증용. 100회 측정은 `bun test`에서
// timeout이 길고 디스크 I/O가 클 수 있으므로 작게 30회로 검증한다.
// 정밀 측정은 scripts/measure-add.sh가 담당.
//
// Bun.spawn은 인자 배열 방식이며 shell을 경유하지 않는다 — command injection 위험 없음.
import { describe, expect, test, beforeAll, afterAll } from "bun:test";
import { mkdtempSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";

const RUNS = 30;
const THRESHOLD_MS = 150; // bun test 환경 오버헤드 감안 — script 결과보다 느슨

let dbDir: string;
let dbPath: string;

beforeAll(() => {
  dbDir = mkdtempSync(join(tmpdir(), "gons-perf-"));
  dbPath = join(dbDir, "tasks.db");
});

afterAll(() => {
  rmSync(dbDir, { recursive: true, force: true });
});

describe("job add latency", () => {
  test(`avg over ${RUNS} runs <= ${THRESHOLD_MS}ms`, async () => {
    const times: number[] = [];
    for (let i = 0; i < RUNS; i++) {
      const start = Bun.nanoseconds();
      const proc = Bun.spawn({
        cmd: ["bun", "run", "src/cli.ts", "add", `perf-${i}`],
        env: { ...process.env, GONS_JOB_DB: dbPath },
        stdout: "ignore",
        stderr: "ignore",
      });
      const code = await proc.exited;
      const ms = (Bun.nanoseconds() - start) / 1_000_000;
      expect(code).toBe(0);
      times.push(ms);
    }
    const avg = times.reduce((a, b) => a + b, 0) / RUNS;
    console.log(`avg=${avg.toFixed(1)}ms`);
    expect(avg).toBeLessThanOrEqual(THRESHOLD_MS);
  }, 60_000); // 30회 × 최대 2초 정도 여유
});
