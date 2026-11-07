
import { expect, it } from "vitest";
import { calculatePlants } from "./planting";


it.each([
    { preset: "2x2", rows: 2, spacing: 15, expected: 160 },
    { preset: "3x3", rows: 3, spacing: 10, expected: 360 },
    { preset: "4x4", rows: 4, spacing: 7.5, expected: 640 },
    { preset: "5x5", rows: 5, spacing: 6, expected: 1000 },
])(
    "full $preset Gridder calculates $expected plants",
   ({ rows, spacing, expected }) => {
       const result = calculatePlants({
           bedLength: 100,
           rows,
           plantSpacing: spacing,
           pattern: "standard",
       });

       expect(result).toBe(expected);
   }
);

it.each([
    { preset: "2x2", rows: 2, spacing: 15, expected: 80 },
    { preset: "3x3", rows: 3, spacing: 10, expected: 180 },
    { preset: "4x4", rows: 4, spacing: 7.5, expected: 320 },
    { preset: "5x5", rows: 5, spacing: 6, expected: 500 },
])(
    "offset $preset Gridder calculates $expected plants",
   ({ rows, spacing, expected }) => {
       const result = calculatePlants({
           bedLength: 100,
           rows,
           plantSpacing: spacing,
           pattern: "offset",
       });

       expect(result).toBe(expected);
   }
);

it("returns 0 when plant spacing is zero", () => {
    const result = calculatePlants({
        bedLength: 100,
        rows: 3,
        plantSpacing: 0,
        pattern: "standard",
    });

    expect(result).toBe(0);
});


it("returns 0 for negative bed length", () => {
    const result = calculatePlants({
        bedLength: -100,
        rows: 3,
        plantSpacing: 10,
        pattern: "standard",
    });

    expect(result).toBe(0);
});


it("rounds up alternating plants for odd grid counts", () => {
    const result = calculatePlants({
        bedLength: 5,
        rows: 3,
        plantSpacing: 12,
        pattern: "offset",
    });

    expect(result).toBe(8);
});
