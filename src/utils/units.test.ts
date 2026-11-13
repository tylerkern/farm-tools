import { expect, it } from "vitest";
import { inchesToCentimeters } from "./units";

it("converts inches to centimeters", () => {
  expect(inchesToCentimeters(30)).toBeCloseTo(76.2);
});
