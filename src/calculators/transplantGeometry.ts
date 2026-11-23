import {
  calculateTransplantCount,
  type TransplantingPattern,
} from "./transplanting";

export const PREVIEW_LENGTH_CM = 152.4; // A 60-inch section
export const MAX_PREVIEW_POSITIONS = 1500;

export type TransplantPosition = {
  key: string;
  xCm: number;
  yCm: number;
};

export type TransplantGeometryInputs = {
  bedWidthCm: number;
  rowCount: number;
  rowSpacingCm: number;
  plantSpacingCm: number;
  pattern: TransplantingPattern;
  bedLengthCm?: number;
};

export type TransplantGeometry = {
  valid: boolean;
  tooDense: boolean;
  bedLengthCm: number;
  bedWidthCm: number;
  positionsPerRow: number;
  totalGridPositions: number;
  positions: TransplantPosition[];
};

/** Generate a centered transplant grid in physical centimeters, not pixels. */
export function calculateTransplantPositions({
  bedWidthCm,
  rowCount,
  rowSpacingCm,
  plantSpacingCm,
  pattern,
  bedLengthCm = PREVIEW_LENGTH_CM,
}: TransplantGeometryInputs): TransplantGeometry {
  const valid =
    Number.isFinite(bedWidthCm) && bedWidthCm > 0 &&
    Number.isFinite(bedLengthCm) && bedLengthCm > 0 &&
    Number.isInteger(rowCount) && rowCount > 0 &&
    Number.isFinite(rowSpacingCm) && rowSpacingCm > 0 &&
    Number.isFinite(plantSpacingCm) && plantSpacingCm > 0 &&
    (pattern === "standard" || pattern === "offset");

  const empty = (tooDense = false): TransplantGeometry => ({
    valid,
    tooDense,
    bedLengthCm,
    bedWidthCm,
    positionsPerRow: 0,
    totalGridPositions: 0,
    positions: [],
  });

  if (!valid) return empty();

  // Use the same numeric boundary tolerance as the main count engine.
  const ratio = bedLengthCm / plantSpacingCm;
  const positionsPerRow = Math.floor(
    ratio + Number.EPSILON * Math.max(1, Math.abs(ratio)) * 4,
  );
  const totalGridPositions = positionsPerRow * rowCount;

  if (!Number.isSafeInteger(totalGridPositions) || totalGridPositions > MAX_PREVIEW_POSITIONS) {
    return {
      ...empty(true),
      positionsPerRow,
      totalGridPositions,
    };
  }

  const startX = (bedLengthCm - (positionsPerRow - 1) * plantSpacingCm) / 2;
  const startY = (bedWidthCm - (rowCount - 1) * rowSpacingCm) / 2;
  const positions: TransplantPosition[] = [];

  for (let row = 0; row < rowCount; row++) {
    for (let column = 0; column < positionsPerRow; column++) {
      if (pattern === "offset" && (row + column) % 2 !== 0) continue;
      positions.push({
        key: `${row}-${column}`,
        xCm: startX + column * plantSpacingCm,
        yCm: startY + row * rowSpacingCm,
      });
    }
  }

  // Keep a single definition of the counting contract.
  const expectedCount = calculateTransplantCount({
    bedLengthCm,
    rowCount,
    plantSpacingCm,
    pattern,
  });
  if (positions.length !== expectedCount) {
    throw new Error("Preview positions and transplant count disagree");
  }

  return {
    valid,
    tooDense: false,
    bedLengthCm,
    bedWidthCm,
    positionsPerRow,
    totalGridPositions,
    positions,
  };
}
