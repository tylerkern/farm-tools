import type { UnitSystem } from "./units";
import type { TransplantingPattern } from "../calculators/transplanting";

const SETTINGS_KEY = "farm-tools:transplant-calculator";
const LEGACY_UNIT_KEY = "farm-tools:unit-system";

export type CalculatorSettings = {
  version: 1;
  unitSystem: UnitSystem;
  bedWidthCm: number;
  bedLengthCm: number;
  rowCount: number;
  rowSpacingCm: number;
  plantSpacingCm: number;
  preset: string;
  pattern: TransplantingPattern;
};

export const DEFAULT_CALCULATOR_SETTINGS: CalculatorSettings = {
  version: 1,
  unitSystem: "imperial",
  bedWidthCm: 76.2,
  bedLengthCm: 3048,
  rowCount: 3,
  rowSpacingCm: 25.4,
  plantSpacingCm: 25.4,
  preset: "3x3",
  pattern: "standard",
};

const positiveFinite = (value: unknown): value is number =>
  typeof value === "number" && Number.isFinite(value) && value > 0;

export function isCalculatorSettings(value: unknown): value is CalculatorSettings {
  if (typeof value !== "object" || value === null) return false;
  const v = value as Record<string, unknown>;
  return (
    v.version === 1 &&
    (v.unitSystem === "imperial" || v.unitSystem === "metric") &&
    positiveFinite(v.bedWidthCm) &&
    positiveFinite(v.bedLengthCm) &&
    Number.isSafeInteger(v.rowCount) &&
    (v.rowCount as number) > 0 &&
    positiveFinite(v.rowSpacingCm) &&
    positiveFinite(v.plantSpacingCm) &&
    typeof v.preset === "string" &&
    (v.preset === "custom" || ["2x2", "3x3", "4x4", "5x5"].includes(v.preset)) &&
    (v.pattern === "standard" || v.pattern === "offset")
  );
}

export function readCalculatorSettings(): CalculatorSettings {
  const defaults = { ...DEFAULT_CALCULATOR_SETTINGS };
  if (typeof window === "undefined") return defaults;
  try {
    const stored = window.localStorage.getItem(SETTINGS_KEY);
    if (stored !== null) {
      const parsed: unknown = JSON.parse(stored);
      if (isCalculatorSettings(parsed)) return parsed;
    }
    // Migrate the unit preference saved by the previous version.
    const legacy = window.localStorage.getItem(LEGACY_UNIT_KEY);
    if (legacy === "metric" || legacy === "imperial") {
      defaults.unitSystem = legacy;
    }
  } catch {
    // Missing, malformed, or blocked storage must never break the calculator.
  }
  return defaults;
}

export function saveCalculatorSettings(settings: CalculatorSettings): void {
  if (typeof window === "undefined" || !isCalculatorSettings(settings)) return;
  try {
    window.localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings));
  } catch {
    // Private browsing or disabled storage: calculator works without saving.
  }
}

export function clearCalculatorSettings(): void {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.removeItem(SETTINGS_KEY);
    window.localStorage.removeItem(LEGACY_UNIT_KEY);
  } catch {
    // Reset the in-memory UI even when storage is unavailable.
  }
}
