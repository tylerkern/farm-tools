import { useState } from "react";
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
import "./App.css";

// Formatting applies only to what the user sees, never to stored measurements.
const displayMeasurement = (value: number): string =>
  String(truncateToTwoDeicmals(value));

function App() {
  const [unitSystem, setUnitSystem] = useState<UnitSystem>("imperial");

  // Canonical bed dimensions: always centimeters.
  const [bedWidthCm, setBedWidthCm] = useState(76.2);
  const [bedLengthCm, setBedLengthCm] = useState(3048);

  // The text currently being edited, expressed in the selected unit system.
  const [bedWidthInput, setBedWidthInput] = useState("30");
  const [bedLengthInput, setBedLengthInput] = useState("100");

  // Spacing remains in inches until the next stage of the metric refactor.
  const [rowCount, setRowCount] = useState(3);
  const [rowSpacing, setRowSpacing] = useState(10);
  const [transplantSpacing, setTransplantSpacing] = useState(10);
  const [preset, setPreset] = useState("3x3");
  const [transplantingPattern, setTransplantingPattern] =
    useState<TransplantingPattern>("standard");

  const validBedWidth =
    bedWidthInput.trim() !== "" &&
    Number.isFinite(Number(bedWidthInput)) &&
    Number(bedWidthInput) > 0;

  const validBedLength =
    bedLengthInput.trim() !== "" &&
    Number.isFinite(Number(bedLengthInput)) &&
    Number(bedLengthInput) > 0;

  const bedWidthInches = centimetersToInches(bedWidthCm);
  const rowsFitOnBed = doRowsFitOnBed(
    bedWidthCm,
    rowCount,
    inchesToCentimeters(rowSpacing),
  );

  const totalPlants =
    validBedWidth && validBedLength
      ? calculateTransplantCount({
          bedLengthCm,
          rowCount,
          plantSpacingCm: inchesToCentimeters(transplantSpacing),
          pattern: transplantingPattern,
        })
      : 0;

  const handleBedWidthChange = (value: string) => {
    setBedWidthInput(value);
    if (value.trim() === "") return;

    const numericValue = Number(value);
    if (!Number.isFinite(numericValue) || numericValue <= 0) return;

    const newWidthCm =
      unitSystem === "imperial"
        ? inchesToCentimeters(numericValue)
        : numericValue;

    setBedWidthCm(newWidthCm);

    if (preset !== "custom") {
      const spacing = calculateGridSpacing(
        centimetersToInches(newWidthCm),
        rowCount,
      );
      setRowSpacing(spacing);
      setTransplantSpacing(spacing);
    }
  };

  const handleBedLengthChange = (value: string) => {
    setBedLengthInput(value);
    if (value.trim() === "") return;

    const numericValue = Number(value);
    if (!Number.isFinite(numericValue) || numericValue <= 0) return;

    setBedLengthCm(
      unitSystem === "imperial"
        ? feetToCentimeters(numericValue)
        : metersToCentimeters(numericValue),
    );
  };

  const handleUnitChange = (newSystem: UnitSystem) => {
    if (newSystem === unitSystem) return;

    setUnitSystem(newSystem);
    setBedWidthInput(
      displayMeasurement(
        newSystem === "imperial" ? centimetersToInches(bedWidthCm) : bedWidthCm,
      ),
    );
    setBedLengthInput(
      displayMeasurement(
        newSystem === "imperial"
          ? centimetersToFeet(bedLengthCm)
          : centimetersToMeters(bedLengthCm),
      ),
    );
  };

  const handlePresetChange = (selectedPreset: GridPreset) => {
    const spacing = calculateGridSpacing(
      bedWidthInches,
      selectedPreset.rowCount,
    );

    setPreset(selectedPreset.id);
    setRowCount(selectedPreset.rowCount);
    setRowSpacing(spacing);
    setTransplantSpacing(spacing);
  };

  const handleRowsChange = (value: number) => {
    setRowCount(Number.isFinite(value) ? Math.max(1, Math.floor(value)) : 1);
    setPreset("custom");
  };

  const handleRowSpacingChange = (value: number) => {
    setRowSpacing(Number.isFinite(value) ? Math.max(0.5, value) : 0.5);
    setPreset("custom");
  };

  const handlePlantSpacingChange = (value: number) => {
    setTransplantSpacing(Number.isFinite(value) ? Math.max(0.5, value) : 0.5);
    setPreset("custom");
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
                  onChange={(event) => handleBedWidthChange(event.target.value)}
                />
                <span>{unitSystem === "imperial" ? "in" : "cm"}</span>
              </div>
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
                  onChange={(event) =>
                    handleBedLengthChange(event.target.value)
                  }
                />
                <span>{unitSystem === "imperial" ? "ft" : "m"}</span>
              </div>
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
              const spacing = calculateGridSpacing(
                bedWidthInches,
                gridPreset.rowCount,
              );

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
                  onClick={() => handlePresetChange(gridPreset)}
                >
                  <span className="preset-title">{gridPreset.id}</span>
                  <span className="preset-description">
                    {validBedWidth
                      ? `${displayMeasurement(spacing)}\" × ${displayMeasurement(spacing)}\"`
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
            {validBedWidth && !rowsFitOnBed && (
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
                value={rowCount}
                onChange={(event) =>
                  handleRowsChange(event.target.valueAsNumber)
                }
              />
            </div>
            <div className="field">
              <label htmlFor="rowSpacing">Row spacing</label>
              <div className="input-with-unit">
                <input
                  id="rowSpacing"
                  type="number"
                  min="0.5"
                  step="any"
                  value={truncateToTwoDeicmals(rowSpacing)}
                  onChange={(event) =>
                    handleRowSpacingChange(event.target.valueAsNumber)
                  }
                />
                <span>in</span>
              </div>
            </div>
            <div className="field">
              <label htmlFor="plantSpacing">Plant spacing</label>
              <div className="input-with-unit">
                <input
                  id="plantSpacing"
                  type="number"
                  min="0.5"
                  step="any"
                  value={truncateToTwoDeicmals(transplantSpacing)}
                  onChange={(event) =>
                    handlePlantSpacingChange(event.target.valueAsNumber)
                  }
                />
                <span>in</span>
              </div>
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
              {totalPlants.toLocaleString()}
            </strong>
          </div>
          <div className="result-details">
            <span>{rowCount} rows</span>
            <span>{displayMeasurement(rowSpacing)}" row spacing</span>
            <span>{displayMeasurement(transplantSpacing)}" plant spacing</span>
          </div>
        </section>

        {/* Preview still expects imperial measurements in this stage. */}
        {validBedWidth && (
          <TransplantingPreview
            bedWidth={bedWidthInches}
            rowCount={rowCount}
            rowSpacing={rowSpacing}
            plantSpacing={transplantSpacing}
            pattern={transplantingPattern}
          />
        )}
      </section>
    </div>
  );
}

export default App;
