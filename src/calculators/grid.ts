export const GRID_PRESETS = [
  { id: "2x2", rowCount: 2 },
  { id: "3x3", rowCount: 3 },
  { id: "4x4", rowCount: 4 },
  { id: "5x5", rowCount: 5 },
] as const;

export type GridPreset = (typeof GRID_PRESETS)[number];

export function calculateGridSpacing(
  bedWidth: number,
  rowCount: number,
): number {
  if (
    !Number.isFinite(bedWidth) ||
    !Number.isInteger(rowCount) ||
    bedWidth <= 0 ||
    rowCount <= 0
  ) {
    return 0;
  }

  return bedWidth / rowCount;
}
