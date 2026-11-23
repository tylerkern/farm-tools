import { expect, it } from "vitest";
import { calculateTransplantCount, doRowsFitOnBed } from "./transplanting";
import {
  feetToCentimeters,
  inchesToCentimeters,
  centimetersToInches,
  metersToCentimeters,
} from "../utils/units";

it.each([
  { preset: "2x2", rowCount: 2, spacing: 15, expected: 160 },
  { preset: "3x3", rowCount: 3, spacing: 10, expected: 360 },
  { preset: "4x4", rowCount: 4, spacing: 7.5, expected: 640 },
  { preset: "5x5", rowCount: 5, spacing: 6, expected: 1000 },
])(
  "full $preset Gridder calculates $expected plants",
  ({ rowCount: rowCount, spacing, expected }) => {
    const result = calculateTransplantCount({
      bedLengthCm: feetToCentimeters(100),
      rowCount: rowCount,
      plantSpacingCm: inchesToCentimeters(spacing),
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
    const result = calculateTransplantCount({
      bedLengthCm: feetToCentimeters(100),
      rowCount: rowCount,
      plantSpacingCm: inchesToCentimeters(spacing),
      pattern: "offset",
    });

    expect(result).toBe(expected);
  },
);

it("returns 0 when plant spacing is zero", () => {
  const result = calculateTransplantCount({
    bedLengthCm: feetToCentimeters(100),
    rowCount: 3,
    plantSpacingCm: inchesToCentimeters(0),
    pattern: "standard",
  });

  expect(result).toBe(0);
});

it("returns 0 for negative bed length", () => {
  const result = calculateTransplantCount({
    bedLengthCm: feetToCentimeters(-100),
    rowCount: 3,
    plantSpacingCm: inchesToCentimeters(10),
    pattern: "standard",
  });

  expect(result).toBe(0);
});

it("rounds up alternating plants for odd grid counts", () => {
  const result = calculateTransplantCount({
    bedLengthCm: feetToCentimeters(5),
    rowCount: 3,
    plantSpacingCm: inchesToCentimeters(12),
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
    expect(doRowsFitOnBed(width, rowCount, spacing)).toBe(expected);
  },
);

it("preserves transplant count across unit conversions", () => {
  const bedLengthCm = feetToCentimeters(100);
  const plantSpacingCm = inchesToCentimeters(10);

  const original = calculateTransplantCount({
    bedLengthCm,
    rowCount: 3,
    plantSpacingCm,
    pattern: "standard",
  });

  const roundTrippedSpacing = inchesToCentimeters(
    centimetersToInches(plantSpacingCm),
  );

  const roundTrippedLength = metersToCentimeters(bedLengthCm / 100);

  const converted = calculateTransplantCount({
    bedLengthCm: roundTrippedLength,
    rowCount: 3,
    plantSpacingCm: roundTrippedSpacing,
    pattern: "standard",
  });

  expect(original).toBe(360);
  expect(converted).toBe(original);
});
