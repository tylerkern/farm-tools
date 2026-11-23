export type TransplantingPattern = "standard" | "offset";

export interface TransplantingInputs {
  bedLengthCm: number;
  rowCount: number;
  plantSpacingCm: number;
  pattern: TransplantingPattern;
}

export function calculateTransplantCount({
  bedLengthCm,
  rowCount,
  plantSpacingCm,
  pattern,
}: TransplantingInputs): number {
  if (
    !Number.isFinite(bedLengthCm) ||
    !Number.isInteger(rowCount) ||
    !Number.isFinite(plantSpacingCm) ||
    bedLengthCm <= 0 ||
    rowCount <= 0 ||
    plantSpacingCm <= 0
  ) {
    return 0;
  }

  // Small tolerance for floating-point conversion errors
  const ratio = bedLengthCm / plantSpacingCm;
  const plantsPerRow = Math.floor(
    ratio + Number.EPSILON * Math.max(1, Math.abs(ratio)) * 4,
  );

  const totalPositions = plantsPerRow * rowCount;

  return pattern === "offset" ? Math.ceil(totalPositions / 2) : totalPositions;
}

export function doRowsFitOnBed(
  bedWidth: number,
  rowCount: number,
  rowSpacing: number,
): boolean {
  if (
    !Number.isFinite(bedWidth) ||
    !Number.isInteger(rowCount) ||
    !Number.isFinite(rowSpacing) ||
    bedWidth <= 0 ||
    rowCount <= 0 ||
    rowSpacing <= 0
  ) {
    return false;
  }

  const requiredWidth = (rowCount - 1) * rowSpacing;

  return requiredWidth <= bedWidth;
}
