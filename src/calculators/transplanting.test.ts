import { expect, it } from "vitest";
import { calculatePlantCount, dorowCountFitOnBed } from "./transplanting";

it.each([
  { preset: "2x2", rowCount: 2, spacing: 15, expected: 160 },
  { preset: "3x3", rowCount: 3, spacing: 10, expected: 360 },
  { preset: "4x4", rowCount: 4, spacing: 7.5, expected: 640 },
  { preset: "5x5", rowCount: 5, spacing: 6, expected: 1000 },
])(
  "full $preset Gridder calculates $expected plants",
  ({ rowCount: rowCount, spacing, expected }) => {
    const result = calculatePlantCount({
      bedLength: 100,
      rowCount: rowCount,
      plantSpacing: spacing,
      pattern: "standard",
    });

    expect(result).toBe(expected);
  },
);

it.each([
  { preset: "2x2", rowCount: 2, spacing: 15, expected: 80 },
  { preset: "3x3", rowCount: 3, spacing: 10, expected: 180 },
  { preset: "4x4", rowCount: 4, spacing: 7.5, expected: 320 },
  { preset: "5x5", rowCount: 5, spacing: 6, expected: 500 },
])(
  "offset $preset Gridder calculates $expected plants",
  ({ rowCount: rowCount, spacing, expected }) => {
    const result = calculatePlantCount({
      bedLength: 100,
      rowCount: rowCount,
      plantSpacing: spacing,
      pattern: "offset",
    });

    expect(result).toBe(expected);
  },
);

it("returns 0 when plant spacing is zero", () => {
  const result = calculatePlantCount({
    bedLength: 100,
    rowCount: 3,
    plantSpacing: 0,
    pattern: "standard",
  });

  expect(result).toBe(0);
});

it("returns 0 for negative bed length", () => {
  const result = calculatePlantCount({
    bedLength: -100,
    rowCount: 3,
    plantSpacing: 10,
    pattern: "standard",
  });

  expect(result).toBe(0);
});

it("rounds up alternating plants for odd grid counts", () => {
  const result = calculatePlantCount({
    bedLength: 5,
    rowCount: 3,
    plantSpacing: 12,
    pattern: "offset",
  });

  expect(result).toBe(8);
});

it.each([
  { width: 30, rowCount: 3, spacing: 10, expected: true },
  { width: 30, rowCount: 5, spacing: 10, expected: false },
  { width: 30, rowCount: 4, spacing: 7.5, expected: true },
  { width: 0, rowCount: 3, spacing: 10, expected: false },
])(
  "$rowCount rowCount at $spacing inches in a $width inch bed",
  ({ width, rowCount, spacing, expected }) => {
    expect(dorowCountFitOnBed(width, rowCount, spacing)).toBe(expected);
  },
);
