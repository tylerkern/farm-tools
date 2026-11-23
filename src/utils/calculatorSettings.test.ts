import { afterEach, describe, expect, it, vi } from "vitest";
import {
  DEFAULT_CALCULATOR_SETTINGS,
  clearCalculatorSettings,
  isCalculatorSettings,
  readCalculatorSettings,
  saveCalculatorSettings,
} from "./calculatorSettings";

afterEach(() => vi.unstubAllGlobals());

function mockStorage(initial: Record<string, string> = {}) {
  const data = new Map(Object.entries(initial));
  const localStorage = {
    getItem: vi.fn((key: string) => data.get(key) ?? null),
    setItem: vi.fn((key: string, value: string) => { data.set(key, value); }),
    removeItem: vi.fn((key: string) => { data.delete(key); }),
  };
  vi.stubGlobal("window", { localStorage });
  return localStorage;
}

describe("transplant calculator settings", () => {
  it("uses defaults without browser storage", () => {
    vi.stubGlobal("window", undefined);
    expect(readCalculatorSettings()).toEqual(DEFAULT_CALCULATOR_SETTINGS);
    expect(() => saveCalculatorSettings(DEFAULT_CALCULATOR_SETTINGS)).not.toThrow();
  });

  it("round-trips a custom metric configuration without rounding", () => {
    mockStorage();
    const config = {
      ...DEFAULT_CALCULATOR_SETTINGS,
      unitSystem: "metric" as const,
      bedWidthCm: 83.3333333333333,
      bedLengthCm: 1200,
      rowCount: 4,
      rowSpacingCm: 20,
      plantSpacingCm: 17.5,
      preset: "custom",
      pattern: "offset" as const,
    };
    saveCalculatorSettings(config);
    expect(readCalculatorSettings()).toEqual(config);
  });

  it("migrates the old unit preference if there are no new settings", () => {
    mockStorage({ "farm-tools:unit-system": "metric" });
    expect(readCalculatorSettings()).toEqual({
      ...DEFAULT_CALCULATOR_SETTINGS,
      unitSystem: "metric",
    });
  });

  it("ignores corrupted saved JSON", () => {
    mockStorage({ "farm-tools:transplant-calculator": "{" });
    expect(readCalculatorSettings()).toEqual(DEFAULT_CALCULATOR_SETTINGS);
  });

  it("ignores invalid measurements and unsupported versions", () => {
    expect(isCalculatorSettings({ ...DEFAULT_CALCULATOR_SETTINGS, bedWidthCm: -5 })).toBe(false);
    expect(isCalculatorSettings({ ...DEFAULT_CALCULATOR_SETTINGS, rowCount: 2.5 })).toBe(false);
    expect(isCalculatorSettings({ ...DEFAULT_CALCULATOR_SETTINGS, version: 2 })).toBe(false);
    expect(isCalculatorSettings(DEFAULT_CALCULATOR_SETTINGS)).toBe(true);
  });

  it("clears new and legacy preferences on reset", () => {
    const storage = mockStorage({
      "farm-tools:transplant-calculator": JSON.stringify(DEFAULT_CALCULATOR_SETTINGS),
      "farm-tools:unit-system": "metric",
    });
    clearCalculatorSettings();
    expect(storage.removeItem).toHaveBeenCalledWith("farm-tools:transplant-calculator");
    expect(storage.removeItem).toHaveBeenCalledWith("farm-tools:unit-system");
    expect(readCalculatorSettings()).toEqual(DEFAULT_CALCULATOR_SETTINGS);
  });

  it("does not throw when storage is blocked", () => {
    vi.stubGlobal("window", { localStorage: {
      getItem: () => { throw Error("blocked"); },
      setItem: () => { throw Error("blocked"); },
      removeItem: () => { throw Error("blocked"); },
    } });
    expect(readCalculatorSettings()).toEqual(DEFAULT_CALCULATOR_SETTINGS);
    expect(() => saveCalculatorSettings(DEFAULT_CALCULATOR_SETTINGS)).not.toThrow();
    expect(() => clearCalculatorSettings()).not.toThrow();
  });
});
