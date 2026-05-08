import { describe, expect, test } from "bun:test";
import { parseTags } from "../../src/lib/parse-tags";

describe("parseTags", () => {
  test("extracts simple ascii tags", () => {
    expect(parseTags("hello #world")).toEqual(["world"]);
  });

  test("extracts multiple tags", () => {
    expect(parseTags("#design 도메인 그림 #urgent")).toEqual([
      "design",
      "urgent",
    ]);
  });

  test("supports korean letters", () => {
    expect(parseTags("일감 #업무 정리")).toEqual(["업무"]);
  });

  test("supports digits, dash, underscore", () => {
    expect(parseTags("#bug-42 #v_2")).toEqual(["bug-42", "v_2"]);
  });

  test("double hash escapes (no extraction)", () => {
    expect(parseTags("##notatag")).toEqual([]);
  });

  test("hash followed by space is not a tag", () => {
    expect(parseTags("foo # bar")).toEqual([]);
  });

  test("standalone #tag is valid", () => {
    expect(parseTags("#bug")).toEqual(["bug"]);
  });

  test("dedupes repeated tags", () => {
    expect(parseTags("#a foo #a bar #a")).toEqual(["a"]);
  });

  test("rejects tag longer than 32 chars", () => {
    const long = "a".repeat(33);
    expect(parseTags(`#${long}`)).toEqual([]);
  });

  test("accepts tag of exactly 32 chars", () => {
    const ok = "a".repeat(32);
    expect(parseTags(`#${ok}`)).toEqual([ok]);
  });

  test("emoji terminates the tag", () => {
    expect(parseTags("#bug🚨 next")).toEqual(["bug"]);
  });
});
