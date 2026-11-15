import { describe, expect, it } from "vitest";
import {
  inchesToCentimeters,
  centimetersToInches,
  feetToCentimeters,
  centimetersToFeet,
  metersToCentimeters,
  centimetersToMeters,
} from "./units";

describe("Imperial and metric conversions", () => {
  it.each([
    { input: 1, expected: 2.54 },
    { input: 30, expected: 76.2 },
    { input: 7.5, expected: 19.05 },
    { input: 0, expected: 0 },
  ])("converts $input inches to $expected cm", ({ input, expected }) => {
    expect(inchesToCentimeters(input)).toBeCloseTo(expected);
  });

  it.each([
    { input: 2.54, expected: 1 },
    { input: 76.2, expected: 30 },
    { input: 19.05, expected: 7.5 },
    { input: 0, expected: 0 },
  ])("converts $input cm to $expected inches", ({ input, expected }) => {
    expect(centimetersToInches(input)).toBeCloseTo(expected);
  });

  it.each([
    { input: 1, expected: 30.48 },
    { input: 100, expected: 3048 },
    { input: 2.5, expected: 76.2 },
    { input: 0, expected: 0 },
  ])("converts $input feet to $expected cm", ({ input, expected }) => {
    expect(feetToCentimeters(input)).toBeCloseTo(expected);
  });

  it.each([
    { input: 30.48, expected: 1 },
    { input: 3048, expected: 100 },
    { input: 76.2, expected: 2.5 },
    { input: 0, expected: 0 },
  ])("converts $input cm to $expected feet", ({ input, expected }) => {
    expect(centimetersToFeet(input)).toBeCloseTo(expected);
  });

  it.each([
    { input: 1, expected: 100 },
    { input: 30, expected: 3000 },
    { input: 0.75, expected: 75 },
    { input: 0, expected: 0 },
  ])("converts $input meters to $expected cm", ({ input, expected }) => {
    expect(metersToCentimeters(input)).toBeCloseTo(expected);
  });

  it.each([
    { input: 100, expected: 1 },
    { input: 3000, expected: 30 },
    { input: 75, expected: 0.75 },
    { input: 0, expected: 0 },
  ])("converts $input cm to $expected meters", ({ input, expected }) => {
    expect(centimetersToMeters(input)).toBeCloseTo(expected);
  });
});

describe("Round-trip conversions", () => {
  it.each([0, 1, 7.5, 30, 100])(
    "preserves %s inches after a round trip",
    (value) => {
      expect(centimetersToInches(inchesToCentimeters(value))).toBeCloseTo(
        value,
        10,
      );
    },
  );

  it.each([0, 1, 2.5, 50, 100])(
    "preserves %s feet after a round trip",
    (value) => {
      expect(centimetersToFeet(feetToCentimeters(value))).toBeCloseTo(
        value,
        10,
      );
    },
  );

  it.each([0, 0.75, 1, 30.48, 100])(
    "preserves %s meters after a round trip",
    (value) => {
      expect(centimetersToMeters(metersToCentimeters(value))).toBeCloseTo(
        value,
        10,
      );
    },
  );
});
