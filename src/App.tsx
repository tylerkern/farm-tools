import { useState } from "react";
import TransplantingPreview from "./components/TransplantingPreview";
import {
  calculatePlantCount,
  doRowsFitOnBed,
  type TransplantingPattern,
} from "./calculators/transplanting";
import "./App.css";
import {
  GRID_PRESETS,
  calculateGridSpacing,
  type GridPreset,
} from "./calculators/grid";

function App() {
  const [bedLength, setBedLength] = useState("100");
  const [bedWidth, setBedWidth] = useState("30");
  const [rowCount, setRowCount] = useState(3);
  const [rowSpacing, setRowSpacing] = useState(10);
  const [transplantSpacing, setTransplantSpacing] = useState(10);

  const [preset, setPreset] = useState("3x3");

  const [transplantingPattern, setTransplantingPattern] =
    useState<TransplantingPattern>("standard");

  const rowsFitOnBed = doRowsFitOnBed(Number(bedWidth), rowCount, rowSpacing);

  const totalPlants = calculatePlantCount({
    bedLength: Number(bedLength),
    rowCount: rowCount,
    plantSpacing: transplantSpacing,
    pattern: transplantingPattern,
  });

  const handlePresetChange = (selectedPreset: GridPreset) => {
    const spacing = calculateGridSpacing(
      Number(bedWidth),
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
        <div className="form-grid">
          <div className="field">
            <label htmlFor="bedWidth">Bed width</label>

            <div className="input-with-unit">
              <input
                id="bedWidth"
                type="number"
                min="1"
                step="0.5"
                value={bedWidth}
                onChange={(event) => {
                  const newWidth = event.target.value;
                  setBedWidth(newWidth);

                  if (preset !== "custom") {
                    const spacing = calculateGridSpacing(
                      Number(newWidth),
                      rowCount,
                    );

                    setRowSpacing(spacing);
                    setTransplantSpacing(spacing);
                  }
                }}
              />
              <span>in</span>
            </div>
          </div>
          <div className="field">
            <label htmlFor="bedLength">Bed length</label>
            <div className="input-with-unit">
              <input
                id="bedLength"
                type="number"
                min="1"
                step="1"
                value={bedLength}
                onChange={(event) => setBedLength(event.target.value)}
              />
              <span>ft</span>
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
            {GRID_PRESETS.map((gridPreset) => (
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
                  {calculateGridSpacing(Number(bedWidth), gridPreset.rowCount)}"
                  {" × "}
                  {calculateGridSpacing(Number(bedWidth), gridPreset.rowCount)}"
                </span>
              </button>
            ))}
          </div>
        </div>

        <div className="section-block">
          <div className="section-heading">
            <h2>Manual Spacing</h2>
            <p>Adjust row and plant spacing independently.</p>
            {bedWidth.trim() !== "" && !rowsFitOnBed && (
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
                  step="0.5"
                  value={rowSpacing}
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
                  step="0.5"
                  value={transplantSpacing}
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
            <span>{rowSpacing}" row spacing</span>
            <span>{transplantSpacing}" plant spacing</span>
          </div>
        </section>

        <TransplantingPreview
          bedWidth={Number(bedWidth)}
          rowCount={rowCount}
          rowSpacing={rowSpacing}
          plantSpacing={transplantSpacing}
          pattern={transplantingPattern}
        />
      </section>
    </div>
  );
}

export default App;
