import { describe, expect, it } from "vitest";
import { calculateTransplantCount } from "./transplanting";
import {
  calculateTransplantPositions,
  MAX_PREVIEW_POSITIONS,
  PREVIEW_LENGTH_CM,
} from "./transplantGeometry";

const base = {
  bedWidthCm: 76.2,
  rowCount: 3,
  rowSpacingCm: 25.4,
  plantSpacingCm: 25.4,
  pattern: "standard" as const,
};

describe("transplant preview geometry", () => {
  it("places a 3×3 grid on a 60-inch section", () => {
    const result = calculateTransplantPositions(base);
    expect(result.valid).toBe(true);
    expect(result.tooDense).toBe(false);
    expect(result.positionsPerRow).toBe(6);
    expect(result.positions).toHaveLength(18);
  });

  it("uses the same number of positions as the count engine", () => {
    for (const rowCount of [2, 3, 4, 5]) {
      for (const pattern of ["standard", "offset"] as const) {
        const plantSpacingCm = 76.2 / rowCount;
        const result = calculateTransplantPositions({
          ...base,
          rowCount,
          rowSpacingCm: plantSpacingCm,
          plantSpacingCm,
          pattern,
        });
        const expected = calculateTransplantCount({
          bedLengthCm: PREVIEW_LENGTH_CM,
          rowCount,
          plantSpacingCm,
          pattern,
        });
        expect(result.positions).toHaveLength(expected);
      }
    }
  });

  it("maintains equal real-world horizontal and vertical spacing", () => {
    const result = calculateTransplantPositions(base);
    const first = result.positions.find((p) => p.key === "0-0")!;
    const nextColumn = result.positions.find((p) => p.key === "0-1")!;
    const nextRow = result.positions.find((p) => p.key === "1-0")!;
    expect(nextColumn.xCm - first.xCm).toBeCloseTo(25.4);
    expect(nextRow.yCm - first.yCm).toBeCloseTo(25.4);
  });

  it("centers the grid within the section", () => {
    const result = calculateTransplantPositions(base);
    const xs = result.positions.map((p) => p.xCm);
    const ys = result.positions.map((p) => p.yCm);
    expect(Math.min(...xs) + Math.max(...xs)).toBeCloseTo(PREVIEW_LENGTH_CM);
    expect(Math.min(...ys) + Math.max(...ys)).toBeCloseTo(base.bedWidthCm);
  });

  it("alternates positions in a checkerboard pattern", () => {
    const result = calculateTransplantPositions({ ...base, pattern: "offset" });
    expect(result.positions).toHaveLength(9);
    expect(result.positions.map((p) => p.key)).toContain("0-0");
    expect(result.positions.map((p) => p.key)).not.toContain("0-1");
    expect(result.positions.map((p) => p.key)).not.toContain("1-0");
    expect(result.positions.map((p) => p.key)).toContain("1-1");
  });

  it("handles an odd number of alternating positions", () => {
    const result = calculateTransplantPositions({
      ...base,
      bedLengthCm: 50,
      rowCount: 3,
      plantSpacingCm: 20,
      pattern: "offset",
    });
    expect(result.positions).toHaveLength(3); // 2 positions per row × 3 rows / 2
  });

  it("allows zero positions when spacing exceeds the section", () => {
    const result = calculateTransplantPositions({
      ...base,
      plantSpacingCm: PREVIEW_LENGTH_CM + 1,
    });
    expect(result.valid).toBe(true);
    expect(result.positions).toHaveLength(0);
  });

  it.each([
    { bedWidthCm: 0 },
    { bedWidthCm: Number.NaN },
    { rowCount: 2.5 },
    { plantSpacingCm: 0 },
    { rowSpacingCm: -1 },
  ])("rejects invalid geometry: %o", (override) => {
    const result = calculateTransplantPositions({ ...base, ...override });
    expect(result.valid).toBe(false);
    expect(result.positions).toHaveLength(0);
  });

  it("does not generate an excessive number of SVG elements", () => {
    const result = calculateTransplantPositions({
      ...base,
      plantSpacingCm: 0.001,
    });
    expect(result.valid).toBe(true);
    expect(result.tooDense).toBe(true);
    expect(result.positions).toHaveLength(0);
    expect(result.totalGridPositions).toBeGreaterThan(MAX_PREVIEW_POSITIONS);
  });
});
