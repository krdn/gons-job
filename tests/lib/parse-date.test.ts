import { describe, expect, test, afterEach } from "bun:test";
import { parseDate } from "../../src/lib/parse-date";
import { resetNowForTesting, setNowForTesting } from "../../src/lib/now";

describe("parseDate", () => {
  afterEach(() => resetNowForTesting());

  test("ISO 8601 date passes through", () => {
    expect(parseDate("2026-05-20")).toBe("2026-05-20");
  });

  test("relative +3d", () => {
    setNowForTesting(() => new Date("2026-05-08T03:00:00Z")); // KST 12:00
    expect(parseDate("+3d")).toBe("2026-05-11");
  });

  test("relative +1w", () => {
    setNowForTesting(() => new Date("2026-05-08T03:00:00Z"));
    expect(parseDate("+1w")).toBe("2026-05-15");
  });

  test("tomorrow alias", () => {
    setNowForTesting(() => new Date("2026-05-08T03:00:00Z"));
    expect(parseDate("tomorrow")).toBe("2026-05-09");
  });

  test("invalid input throws", () => {
    expect(() => parseDate("not-a-date")).toThrow();
  });

  test("invalid relative throws", () => {
    expect(() => parseDate("+3y")).toThrow();
  });
});
