/** Validation of editable measurements (strings until the user finishes typing). */
export function parsePositiveMeasurement(value: string): number | null {
  if (value.trim() === "") return null;
  const parsed = Number(value);
  return Number.isFinite(parsed) && parsed > 0 ? parsed : null;
}

export function parseRowCount(value: string): number | null {
  const parsed = parsePositiveMeasurement(value);
  return parsed !== null && Number.isSafeInteger(parsed) ? parsed : null;
}

