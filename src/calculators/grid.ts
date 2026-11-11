export const GRID_PRESETS = [
  { id: "2x2", rows: 2 },
  { id: "3x3", rows: 3 },
  { id: "4x4", rows: 4 },
  { id: "5x5", rows: 5 },
] as const;

export type GridPreset = (typeof GRID_PRESETS)[number];

export function calculateGridSpacing(bedWidth: number, rows: number): number {
  if (
    !Number.isFinite(bedWidth) ||
    !Number.isInteger(rows) ||
    bedWidth <= 0 ||
    rows <= 0
  ) {
    return 0;
  }

  return bedWidth / rows;
}
