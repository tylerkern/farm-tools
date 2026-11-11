export type TransplantingPattern = "standard" | "offset";

export interface TransplantingInputs {
  bedLength: number; // feet
  rowCount: number;
  plantSpacing: number; // inches
  pattern: TransplantingPattern;
}

export function calculatePlantCount({
  bedLength,
  rowCount,
  plantSpacing,
  pattern,
}: TransplantingInputs): number {
  if (
    !Number.isFinite(bedLength) ||
    !Number.isInteger(rowCount) ||
    !Number.isFinite(plantSpacing) ||
    bedLength <= 0 ||
    rowCount <= 0 ||
    plantSpacing <= 0
  ) {
    return 0;
  }

  const plantsPerRow = Math.floor((bedLength * 12) / plantSpacing);

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
