import { describe, expect, it } from "vitest";
import {
  parsePositiveMeasurement,
  parseRowCount,
} from "./inputValidation";

describe("editable measurement validation", () => {
  it.each(["", "  ", "0", "-1", "Infinity", "NaN", "abc", "1e999"]) (
    "rejects invalid measurement %j",
    (text) => expect(parsePositiveMeasurement(text)).toBeNull(),
  );

  it.each(["0.01", "7.5", "100", " 2 "]) (
    "accepts valid measurement %j",
    (text) => expect(parsePositiveMeasurement(text)).toBe(Number(text)),
  );

  it.each(["", "0", "-2", "2.5", "Infinity", "9007199254740992"]) (
    "rejects invalid row count %j",
    (text) => expect(parseRowCount(text)).toBeNull(),
  );

  it("accepts an integer row count", () => {
    expect(parseRowCount("3")).toBe(3);
  });

});
