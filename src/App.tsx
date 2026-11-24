import { useEffect, useState } from "react";
import TransplantingPreview from "./components/TransplantingPreview";
import { truncateToTwoDeicmals } from "./utils/format";
import {
  centimetersToFeet,
  centimetersToInches,
  centimetersToMeters,
  feetToCentimeters,
  inchesToCentimeters,
  metersToCentimeters,
  type UnitSystem,
} from "./utils/units";
import {
  calculateTransplantCount,
  doRowsFitOnBed,
  type TransplantingPattern,
} from "./calculators/transplanting";
import {
  GRID_PRESETS,
  calculateGridSpacing,
  type GridPreset,
} from "./calculators/grid";
import { parsePositiveMeasurement, parseRowCount } from "./utils/inputValidation";
import {
  DEFAULT_CALCULATOR_SETTINGS,
  readCalculatorSettings,
  saveCalculatorSettings,
  clearCalculatorSettings,
} from "./utils/calculatorSettings";
import { getTranslations, type Language } from "./i18n";
import "./App.css";

// Formatting applies only to what the user sees, never to stored measurements.
const displayMeasurement = (value: number): string =>
  String(truncateToTwoDeicmals(value));

type AppProps = { language: Language };

function App({ language }: AppProps) {
  const t = getTranslations(language);
  // Read local storage once. Canonical distances are always in centimeters.
  const [initialSettings] = useState(readCalculatorSettings);
  const [unitSystem, setUnitSystem] = useState<UnitSystem>(initialSettings.unitSystem);
  const [bedWidthCm, setBedWidthCm] = useState(initialSettings.bedWidthCm);
  const [bedLengthCm, setBedLengthCm] = useState(initialSettings.bedLengthCm);
  const [rowSpacingCm, setRowSpacingCm] = useState(initialSettings.rowSpacingCm);
  const [transplantSpacingCm, setTransplantSpacingCm] = useState(initialSettings.plantSpacingCm);
  const [rowCountInput, setRowCountInput] = useState(String(initialSettings.rowCount));
  const [preset, setPreset] = useState(initialSettings.preset);
  const [transplantingPattern, setTransplantingPattern] =
    useState<TransplantingPattern>(initialSettings.pattern);

  const displayInSelectedUnits = (centimeters: number): string =>
    displayMeasurement(
      unitSystem === "imperial" ? centimetersToInches(centimeters) : centimeters,
    );

  const [bedWidthInput, setBedWidthInput] = useState(() =>
    displayInSelectedUnits(initialSettings.bedWidthCm),
  );
  const [bedLengthInput, setBedLengthInput] = useState(() =>
    displayMeasurement(
      initialSettings.unitSystem === "imperial"
        ? centimetersToFeet(initialSettings.bedLengthCm)
        : centimetersToMeters(initialSettings.bedLengthCm),
    ),
  );
  const [rowSpacingInput, setRowSpacingInput] = useState(() =>
    displayInSelectedUnits(initialSettings.rowSpacingCm),
  );
  const [transplantSpacingInput, setTransplantSpacingInput] = useState(() =>
    displayInSelectedUnits(initialSettings.plantSpacingCm),
  );
  const rowCount = parseRowCount(rowCountInput) ?? 0;

  // Invalid input stays editable but cannot influence calculations.
  const validBedWidth = parsePositiveMeasurement(bedWidthInput) !== null;
  const validBedLength = parsePositiveMeasurement(bedLengthInput) !== null;
  const validRowCount = parseRowCount(rowCountInput) !== null;
  const validRowSpacing = parsePositiveMeasurement(rowSpacingInput) !== null;
  const validTransplantSpacing = parsePositiveMeasurement(transplantSpacingInput) !== null;

  const allInputsValid =
    validBedWidth && validBedLength && validRowCount &&
    validRowSpacing && validTransplantSpacing;

  // Only persist complete, valid configurations. Never save an empty/half-typed input.
  useEffect(() => {
    if (!allInputsValid) return;
    saveCalculatorSettings({
      version: 1,
      unitSystem,
      bedWidthCm,
      bedLengthCm,
      rowCount,
      rowSpacingCm,
      plantSpacingCm: transplantSpacingCm,
      preset,
      pattern: transplantingPattern,
    });
  }, [
    allInputsValid, unitSystem, bedWidthCm, bedLengthCm, rowCount,
    rowSpacingCm, transplantSpacingCm, preset, transplantingPattern,
  ]);

  const handleReset = () => {
    clearCalculatorSettings();
    const defaults = DEFAULT_CALCULATOR_SETTINGS;
    setUnitSystem(defaults.unitSystem);
    setBedWidthCm(defaults.bedWidthCm);
    setBedLengthCm(defaults.bedLengthCm);
    setRowCountInput(String(defaults.rowCount));
    setRowSpacingCm(defaults.rowSpacingCm);
    setTransplantSpacingCm(defaults.plantSpacingCm);
    setPreset(defaults.preset);
    setTransplantingPattern(defaults.pattern);
    setBedWidthInput("30");
    setBedLengthInput("100");
    setRowSpacingInput("10");
    setTransplantSpacingInput("10");
  };

  const rowsFitOnBed = doRowsFitOnBed(
    bedWidthCm,
    rowCount,
    rowSpacingCm,
  );

  const rawTotalPlants =
    allInputsValid && rowsFitOnBed
      ? calculateTransplantCount({
          bedLengthCm,
          rowCount,
          plantSpacingCm: transplantSpacingCm,
          pattern: transplantingPattern,
        })
      : null;

  const validTotalPlants =
    rawTotalPlants !== null &&
    Number.isSafeInteger(rawTotalPlants) && rawTotalPlants >= 0;

  const handleBedWidthChange = (value: string) => {
    setBedWidthInput(value);
    if (value.trim() === "") return;

    const numericValue = parsePositiveMeasurement(value);
    if (numericValue === null) return;

    const newWidthCm =
      unitSystem === "imperial"
        ? inchesToCentimeters(numericValue)
        : numericValue;

    setBedWidthCm(newWidthCm);

    if (preset !== "custom") {
      const spacingCm = calculateGridSpacing(newWidthCm, rowCount);
      setRowSpacingCm(spacingCm);
      setTransplantSpacingCm(spacingCm);
      const displayedSpacing = displayMeasurement(
        unitSystem === "imperial"
          ? centimetersToInches(spacingCm)
          : spacingCm,
      );
      setRowSpacingInput(displayedSpacing);
      setTransplantSpacingInput(displayedSpacing);
    }
  };

  const handleBedLengthChange = (value: string) => {
    setBedLengthInput(value);
    if (value.trim() === "") return;

    const numericValue = parsePositiveMeasurement(value);
    if (numericValue === null) return;

    setBedLengthCm(
      unitSystem === "imperial"
        ? feetToCentimeters(numericValue)
        : metersToCentimeters(numericValue),
    );
  };

  const handleUnitChange = (newSystem: UnitSystem) => {
    if (newSystem === unitSystem) return;

    setUnitSystem(newSystem);
    // Do not replace empty/invalid input with an old stored measurement.
    if (validBedWidth) {
      setBedWidthInput(displayMeasurement(
        newSystem === "imperial" ? centimetersToInches(bedWidthCm) : bedWidthCm,
      ));
    }
    if (validBedLength) {
      setBedLengthInput(displayMeasurement(
        newSystem === "imperial" ? centimetersToFeet(bedLengthCm) : centimetersToMeters(bedLengthCm),
      ));
    }
    if (validRowSpacing) {
      setRowSpacingInput(displayMeasurement(
        newSystem === "imperial" ? centimetersToInches(rowSpacingCm) : rowSpacingCm,
      ));
    }
    if (validTransplantSpacing) {
      setTransplantSpacingInput(displayMeasurement(
        newSystem === "imperial" ? centimetersToInches(transplantSpacingCm) : transplantSpacingCm,
      ));
    }
  };

  const handlePresetChange = (selectedPreset: GridPreset) => {
    if (!validBedWidth) return;
    const spacingCm = calculateGridSpacing(bedWidthCm, selectedPreset.rowCount);
    const displayedSpacing = displayMeasurement(
      unitSystem === "imperial"
        ? centimetersToInches(spacingCm)
        : spacingCm,
    );

    setPreset(selectedPreset.id);
    setRowCountInput(String(selectedPreset.rowCount));
    setRowSpacingCm(spacingCm);
    setTransplantSpacingCm(spacingCm);
    setRowSpacingInput(displayedSpacing);
    setTransplantSpacingInput(displayedSpacing);
  };

  const handleRowsChange = (value: string) => {
    setRowCountInput(value);
    setPreset("custom");
  };

  const handleRowSpacingChange = (value: string) => {
    setRowSpacingInput(value);
    setPreset("custom");
    if (parsePositiveMeasurement(value) === null) return;
    setRowSpacingCm(
      unitSystem === "imperial" ? inchesToCentimeters(Number(value)) : Number(value),
    );
  };

  const handlePlantSpacingChange = (value: string) => {
    setTransplantSpacingInput(value);
    setPreset("custom");
    if (parsePositiveMeasurement(value) === null) return;
    setTransplantSpacingCm(
      unitSystem === "imperial" ? inchesToCentimeters(Number(value)) : Number(value),
    );
  };

  return (
    <div className="calculator-page">
      <section className="calculator-card">
        <div className="calculator-heading">
          <div>
            <h1>{t.title}</h1>
            <p>{t.description}</p>
          </div>
        </div>

        <div className="section-block bed-details">
          <div className="bed-details-header">
            <div>
              <h2>{t.bedDetails}</h2>
              <p>{t.bedDetailsDescription}</p>
            </div>
            <div className="bed-details-actions">
              <button type="button" className="reset-button" onClick={handleReset}>
                {t.reset}
              </button>
              <div
              className="unit-toggle"
              role="group"
              aria-label={t.measurementSystem}
            >
              <button
                type="button"
                className={unitSystem === "imperial" ? "active" : ""}
                aria-pressed={unitSystem === "imperial"}
                onClick={() => handleUnitChange("imperial")}
              >
                {t.imperial}
              </button>
              <button
                type="button"
                className={unitSystem === "metric" ? "active" : ""}
                aria-pressed={unitSystem === "metric"}
                onClick={() => handleUnitChange("metric")}
              >
                {t.metric}
              </button>
              </div>
            </div>
          </div>

          <div className="form-grid">
            <div className="field">
              <label htmlFor="bedWidth">{t.bedWidth}</label>
              <div className="input-with-unit">
                <input
                  id="bedWidth"
                  type="number"
                  min="0"
                  step="any"
                  value={bedWidthInput}
                  aria-invalid={!validBedWidth}
                  aria-describedby={!validBedWidth ? "bedWidthError" : undefined}
                  onChange={(event) =>
                    handleBedWidthChange(event.target.value)
                  }
                />
                <span>{unitSystem === "imperial" ? "in" : "cm"}</span>
              </div>
              {!validBedWidth && <p id="bedWidthError" className="spacing-warning">{t.invalidBedWidth}</p>}
            </div>
            <div className="field">
              <label htmlFor="bedLength">{t.bedLength}</label>
              <div className="input-with-unit">
                <input
                  id="bedLength"
                  type="number"
                  min="0"
                  step="any"
                  value={bedLengthInput}
                  aria-invalid={!validBedLength}
                  aria-describedby={!validBedLength ? "bedLengthError" : undefined}
                  onChange={(event) =>
                    handleBedLengthChange(event.target.value)
                  }
                />
                <span>{unitSystem === "imperial" ? "ft" : "m"}</span>
              </div>
              {!validBedLength && <p id="bedLengthError" className="spacing-warning">{t.invalidBedLength}</p>}
            </div>
          </div>
        </div>

        <div className="section-block">
          <div className="section-heading">
            <h2>{t.gridPresets}</h2>
            <p>{t.gridPresetsDescription}</p>
          </div>
          <div className="preset-grid">
            {GRID_PRESETS.map((gridPreset) => {
              const spacingCm = calculateGridSpacing(
                bedWidthCm,
                gridPreset.rowCount,
              );
              const spacing = unitSystem === "imperial"
                ? centimetersToInches(spacingCm)
                : spacingCm;
              const spacingUnit = unitSystem === "imperial" ? '"' : " cm";

              return (
                <button
                  key={gridPreset.id}
                  type="button"
                  className={
                    preset === gridPreset.id
                      ? "preset-button active"
                      : "preset-button"
                  }
                  aria-pressed={preset === gridPreset.id}
                  disabled={!validBedWidth}
                  onClick={() => handlePresetChange(gridPreset)}
                >
                  <span className="preset-title">{gridPreset.id}</span>
                  <span className="preset-description">
                    {validBedWidth
                      ? `${displayMeasurement(spacing)}${spacingUnit} × ${displayMeasurement(spacing)}${spacingUnit}`
                      : "—"}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        <div className="section-block">
          <div className="section-heading">
            <h2>{t.manualSpacing}</h2>
            <p>{t.manualSpacingDescription}</p>
            {validBedWidth && validRowCount && validRowSpacing && !rowsFitOnBed && (
              <p className="spacing-warning">
                {t.rowsDoNotFit}
              </p>
            )}
          </div>
          <div className="spacing-controls">
            <div className="field">
              <label htmlFor="rows">{t.rowCount}</label>
              <input
                id="rows"
                type="number"
                min="1"
                step="1"
                value={rowCountInput}
                aria-invalid={!validRowCount}
                aria-describedby={!validRowCount ? "rowCountError" : undefined}
                onChange={(event) => handleRowsChange(event.target.value)}
              />
              {!validRowCount && <p id="rowCountError" className="spacing-warning">{t.invalidRowCount}</p>}
            </div>
            <div className="field">
              <label htmlFor="rowSpacing">{t.rowSpacing}</label>
              <div className="input-with-unit">
                <input
                  id="rowSpacing"
                  type="number"
                  min="0"
                  step="any"
                  value={rowSpacingInput}
                  aria-invalid={!validRowSpacing}
                  aria-describedby={!validRowSpacing ? "rowSpacingError" : undefined}
                  onChange={(event) =>
                    handleRowSpacingChange(event.target.value)
                  }
                />
                <span>{unitSystem === "imperial" ? "in" : "cm"}</span>
              </div>
              {!validRowSpacing && <p id="rowSpacingError" className="spacing-warning">{t.invalidRowSpacing}</p>}
            </div>
            <div className="field">
              <label htmlFor="plantSpacing">{t.inRowSpacing}</label>
              <div className="input-with-unit">
                <input
                  id="plantSpacing"
                  type="number"
                  min="0"
                  step="any"
                  value={transplantSpacingInput}
                  aria-invalid={!validTransplantSpacing}
                  aria-describedby={!validTransplantSpacing ? "plantSpacingError" : undefined}
                  onChange={(event) =>
                    handlePlantSpacingChange(event.target.value)
                  }
                />
                <span>{unitSystem === "imperial" ? "in" : "cm"}</span>
              </div>
              {!validTransplantSpacing && <p id="plantSpacingError" className="spacing-warning">{t.invalidInRowSpacing}</p>}
            </div>
          </div>
          {preset === "custom" && (
            <div className="custom-spacing-note">{t.customSpacing}</div>
          )}
        </div>

        <div className="section-block">
          <div className="section-heading">
            <h2>{t.pattern}</h2>
            <p>{t.patternDescription}</p>
          </div>
          <div className="pattern-options">
            <button
              type="button"
              className={
                transplantingPattern === "standard"
                  ? "pattern-button active"
                  : "pattern-button"
              }
              aria-pressed={transplantingPattern === "standard"}
              onClick={() => setTransplantingPattern("standard")}
            >
              {t.fullGrid}
            </button>
            <button
              type="button"
              className={
                transplantingPattern === "offset"
                  ? "pattern-button active"
                  : "pattern-button"
              }
              aria-pressed={transplantingPattern === "offset"}
              onClick={() => setTransplantingPattern("offset")}
            >
              {t.alternatingGrid}
            </button>
          </div>
        </div>

        <section className="results-card">
          <div className="result">
            <span className="result-label">{t.estimatedPlants}</span>
            <strong className="result-value">
              {validTotalPlants ? rawTotalPlants!.toLocaleString() : "—"}
            </strong>
          </div>
          {allInputsValid && !rowsFitOnBed && (
            <p className="spacing-warning">{t.cannotEstimate}</p>
          )}
          {allInputsValid && rowsFitOnBed && !validTotalPlants && (
            <p className="spacing-warning">{t.countTooLarge}</p>
          )}
          <div className="result-details">
            <span>{validRowCount ? rowCount : "—"} {t.rows}</span>
            <span>
              {validRowSpacing ? displayMeasurement(unitSystem === "imperial" ? centimetersToInches(rowSpacingCm) : rowSpacingCm) : "—"} {unitSystem === "imperial" ? "in" : "cm"} {t.rowSpacing.toLowerCase()}
            </span>
            <span>
              {validTransplantSpacing ? displayMeasurement(unitSystem === "imperial" ? centimetersToInches(transplantSpacingCm) : transplantSpacingCm) : "—"} {unitSystem === "imperial" ? "in" : "cm"} {t.inRowSpacing.toLowerCase()}
            </span>
          </div>
        </section>

        {allInputsValid && rowsFitOnBed && validTotalPlants && (
          <TransplantingPreview
            bedWidthCm={bedWidthCm}
            rowCount={rowCount}
            rowSpacingCm={rowSpacingCm}
            plantSpacingCm={transplantSpacingCm}
            pattern={transplantingPattern}
            unitSystem={unitSystem}
            language={language}
          />
        )}
      </section>
    </div>
  );
}

export default App;
