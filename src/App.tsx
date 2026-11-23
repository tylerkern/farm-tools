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
import {
  parsePositiveMeasurement,
  parseRowCount,
} from "./utils/inputValidation";
import {
  DEFAULT_CALCULATOR_SETTINGS,
  readCalculatorSettings,
  saveCalculatorSettings,
  clearCalculatorSettings,
} from "./utils/calculatorSettings";
import "./App.css";

// Formatting applies only to what the user sees, never to stored measurements.
const displayMeasurement = (value: number): string =>
  String(truncateToTwoDeicmals(value));

function App() {
  // Read local storage once. Canonical distances are always in centimeters.
  const [initialSettings] = useState(readCalculatorSettings);
  const [unitSystem, setUnitSystem] = useState<UnitSystem>(
    initialSettings.unitSystem,
  );
  const [bedWidthCm, setBedWidthCm] = useState(initialSettings.bedWidthCm);
  const [bedLengthCm, setBedLengthCm] = useState(initialSettings.bedLengthCm);
  const [rowSpacingCm, setRowSpacingCm] = useState(
    initialSettings.rowSpacingCm,
  );
  const [transplantSpacingCm, setTransplantSpacingCm] = useState(
    initialSettings.plantSpacingCm,
  );
  const [rowCountInput, setRowCountInput] = useState(
    String(initialSettings.rowCount),
  );
  const [preset, setPreset] = useState(initialSettings.preset);
  const [transplantingPattern, setTransplantingPattern] =
    useState<TransplantingPattern>(initialSettings.pattern);

  const displayInSelectedUnits = (centimeters: number): string =>
    displayMeasurement(
      unitSystem === "imperial"
        ? centimetersToInches(centimeters)
        : centimeters,
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
  const validTransplantSpacing =
    parsePositiveMeasurement(transplantSpacingInput) !== null;

  const allInputsValid =
    validBedWidth &&
    validBedLength &&
    validRowCount &&
    validRowSpacing &&
    validTransplantSpacing;

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
    allInputsValid,
    unitSystem,
    bedWidthCm,
    bedLengthCm,
    rowCount,
    rowSpacingCm,
    transplantSpacingCm,
    preset,
    transplantingPattern,
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

  const rowsFitOnBed = doRowsFitOnBed(bedWidthCm, rowCount, rowSpacingCm);

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
    Number.isSafeInteger(rawTotalPlants) &&
    rawTotalPlants >= 0;

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
        unitSystem === "imperial" ? centimetersToInches(spacingCm) : spacingCm,
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
      setBedWidthInput(
        displayMeasurement(
          newSystem === "imperial"
            ? centimetersToInches(bedWidthCm)
            : bedWidthCm,
        ),
      );
    }
    if (validBedLength) {
      setBedLengthInput(
        displayMeasurement(
          newSystem === "imperial"
            ? centimetersToFeet(bedLengthCm)
            : centimetersToMeters(bedLengthCm),
        ),
      );
    }
    if (validRowSpacing) {
      setRowSpacingInput(
        displayMeasurement(
          newSystem === "imperial"
            ? centimetersToInches(rowSpacingCm)
            : rowSpacingCm,
        ),
      );
    }
    if (validTransplantSpacing) {
      setTransplantSpacingInput(
        displayMeasurement(
          newSystem === "imperial"
            ? centimetersToInches(transplantSpacingCm)
            : transplantSpacingCm,
        ),
      );
    }
  };

  const handlePresetChange = (selectedPreset: GridPreset) => {
    if (!validBedWidth) return;
    const spacingCm = calculateGridSpacing(bedWidthCm, selectedPreset.rowCount);
    const displayedSpacing = displayMeasurement(
      unitSystem === "imperial" ? centimetersToInches(spacingCm) : spacingCm,
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
      unitSystem === "imperial"
        ? inchesToCentimeters(Number(value))
        : Number(value),
    );
  };

  const handlePlantSpacingChange = (value: string) => {
    setTransplantSpacingInput(value);
    setPreset("custom");
    if (parsePositiveMeasurement(value) === null) return;
    setTransplantSpacingCm(
      unitSystem === "imperial"
        ? inchesToCentimeters(Number(value))
        : Number(value),
    );
  };

  return (
    <div className="calculator-page">
      <section className="calculator-card">
        <div className="calculator-heading">
          <div>
            <h1>Transplant Calculator</h1>
            <p>Estimate plant counts and visualize your spacing.</p>
          </div>
        </div>

        <div className="section-block bed-details">
          <div className="bed-details-header">
            <div>
              <h2>Bed Details</h2>
              <p>Enter your bed dimensions.</p>
            </div>
            <div className="bed-details-actions">
              <button
                type="button"
                className="reset-button"
                onClick={handleReset}
              >
                Reset to Defaults
              </button>

              <div
                className="unit-toggle"
                role="group"
                aria-label="Measurement system"
              >
                <button
                  type="button"
                  className={unitSystem === "imperial" ? "active" : ""}
                  aria-pressed={unitSystem === "imperial"}
                  onClick={() => handleUnitChange("imperial")}
                >
                  Imperial
                </button>

                <button
                  type="button"
                  className={unitSystem === "metric" ? "active" : ""}
                  aria-pressed={unitSystem === "metric"}
                  onClick={() => handleUnitChange("metric")}
                >
                  Metric
                </button>
              </div>
            </div>
          </div>
          <div
            style={{
              display: "flex",
              justifyContent: "flex-end",
              marginBottom: "12px",
            }}
          ></div>

          <div className="form-grid">
            <div className="field">
              <label htmlFor="bedWidth">Bed width</label>
              <div className="input-with-unit">
                <input
                  id="bedWidth"
                  type="number"
                  min="0"
                  step="any"
                  value={bedWidthInput}
                  aria-invalid={!validBedWidth}
                  aria-describedby={
                    !validBedWidth ? "bedWidthError" : undefined
                  }
                  onChange={(event) => handleBedWidthChange(event.target.value)}
                />
                <span>{unitSystem === "imperial" ? "in" : "cm"}</span>
              </div>
              {!validBedWidth && (
                <p id="bedWidthError" className="spacing-warning">
                  Enter a positive bed width.
                </p>
              )}
            </div>
            <div className="field">
              <label htmlFor="bedLength">Bed length</label>
              <div className="input-with-unit">
                <input
                  id="bedLength"
                  type="number"
                  min="0"
                  step="any"
                  value={bedLengthInput}
                  aria-invalid={!validBedLength}
                  aria-describedby={
                    !validBedLength ? "bedLengthError" : undefined
                  }
                  onChange={(event) =>
                    handleBedLengthChange(event.target.value)
                  }
                />
                <span>{unitSystem === "imperial" ? "ft" : "m"}</span>
              </div>
              {!validBedLength && (
                <p id="bedLengthError" className="spacing-warning">
                  Enter a positive bed length.
                </p>
              )}
            </div>
          </div>
        </div>

        <div className="section-block">
          <div className="section-heading">
            <h2>Grid Presets</h2>
            <p>
              Choose a standard grid pattern or customize the spacing below.
            </p>
          </div>
          <div className="preset-grid">
            {GRID_PRESETS.map((gridPreset) => {
              const spacingCm = calculateGridSpacing(
                bedWidthCm,
                gridPreset.rowCount,
              );
              const spacing =
                unitSystem === "imperial"
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
            <h2>Manual Spacing</h2>
            <p>Adjust row and plant spacing independently.</p>
            {validBedWidth &&
              validRowCount &&
              validRowSpacing &&
              !rowsFitOnBed && (
                <p className="spacing-warning">
                  These rows won't fit within the selected bed width.
                </p>
              )}
          </div>
          <div className="spacing-controls">
            <div className="field">
              <label htmlFor="rows">Number of rows</label>
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
              {!validRowCount && (
                <p id="rowCountError" className="spacing-warning">
                  Enter a positive whole number of rows.
                </p>
              )}
            </div>
            <div className="field">
              <label htmlFor="rowSpacing">Row spacing</label>
              <div className="input-with-unit">
                <input
                  id="rowSpacing"
                  type="number"
                  min="0"
                  step="any"
                  value={rowSpacingInput}
                  aria-invalid={!validRowSpacing}
                  aria-describedby={
                    !validRowSpacing ? "rowSpacingError" : undefined
                  }
                  onChange={(event) =>
                    handleRowSpacingChange(event.target.value)
                  }
                />
                <span>{unitSystem === "imperial" ? "in" : "cm"}</span>
              </div>
              {!validRowSpacing && (
                <p id="rowSpacingError" className="spacing-warning">
                  Enter positive row spacing.
                </p>
              )}
            </div>
            <div className="field">
              <label htmlFor="plantSpacing">Plant spacing</label>
              <div className="input-with-unit">
                <input
                  id="plantSpacing"
                  type="number"
                  min="0"
                  step="any"
                  value={transplantSpacingInput}
                  aria-invalid={!validTransplantSpacing}
                  aria-describedby={
                    !validTransplantSpacing ? "plantSpacingError" : undefined
                  }
                  onChange={(event) =>
                    handlePlantSpacingChange(event.target.value)
                  }
                />
                <span>{unitSystem === "imperial" ? "in" : "cm"}</span>
              </div>
              {!validTransplantSpacing && (
                <p id="plantSpacingError" className="spacing-warning">
                  Enter positive plant spacing.
                </p>
              )}
            </div>
          </div>
          {preset === "custom" && (
            <div className="custom-spacing-note">Custom spacing</div>
          )}
        </div>

        <div className="section-block">
          <div className="section-heading">
            <h2>Pattern</h2>
            <p>
              Plant every intersection or alternate positions on the fixed grid.
            </p>
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
              Full Grid
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
              Alternating Grid
            </button>
          </div>
        </div>

        <section className="results-card">
          <div className="result">
            <span className="result-label">Estimated plants</span>
            <strong className="result-value">
              {validTotalPlants ? rawTotalPlants!.toLocaleString() : "—"}
            </strong>
          </div>
          {allInputsValid && !rowsFitOnBed && (
            <p className="spacing-warning">
              Cannot estimate transplants until all rows fit within the bed.
            </p>
          )}
          {allInputsValid && rowsFitOnBed && !validTotalPlants && (
            <p className="spacing-warning">
              Measurements produce a count too large to calculate reliably.
            </p>
          )}
          <div className="result-details">
            <span>{validRowCount ? rowCount : "—"} rows</span>
            <span>
              {validRowSpacing
                ? displayMeasurement(
                    unitSystem === "imperial"
                      ? centimetersToInches(rowSpacingCm)
                      : rowSpacingCm,
                  )
                : "—"}{" "}
              {unitSystem === "imperial" ? "in" : "cm"} row spacing
            </span>
            <span>
              {validTransplantSpacing
                ? displayMeasurement(
                    unitSystem === "imperial"
                      ? centimetersToInches(transplantSpacingCm)
                      : transplantSpacingCm,
                  )
                : "—"}{" "}
              {unitSystem === "imperial" ? "in" : "cm"} plant spacing
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
          />
        )}
      </section>
    </div>
  );
}

export default App;
