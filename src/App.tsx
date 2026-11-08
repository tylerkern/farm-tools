import { useState } from "react";
import PlantingPreview from "./components/PlantingPreview";
import {
  calculatePlants,
  rowsFitBed,
  type PlantingPattern,
} from "./calculators/planting";
import "./App.css";

type GridderPreset = {
  id: string;
  rows: number;
  rowSpacing: number;
  plantSpacing: number;
};

const GRIDDER_PRESETS: GridderPreset[] = [
  {
    id: "2x2",
    rows: 2,
    rowSpacing: 15,
    plantSpacing: 15,
  },
  {
    id: "3x3",
    rows: 3,
    rowSpacing: 10,
    plantSpacing: 10,
  },
  {
    id: "4x4",
    rows: 4,
    rowSpacing: 7.5,
    plantSpacing: 7.5,
  },
  {
    id: "5x5",
    rows: 5,
    rowSpacing: 6,
    plantSpacing: 6,
  },
];

function App() {
  const [bedLength, setBedLength] = useState("100");
  const [bedWidth, setBedWidth] = useState("30");
  const [rows, setRows] = useState(3);
  const [rowSpacing, setRowSpacing] = useState(10);
  const [plantSpacing, setPlantSpacing] = useState(10);

  const [preset, setPreset] = useState("3x3");

  const [plantingPattern, setPlantingPattern] =
  useState<PlantingPattern>("standard");

  const rowsFit = rowsFitBed(
    Number(bedWidth),
    rows,
    rowSpacing
  );

  const totalPlants = calculatePlants({
    bedLength: Number(bedLength),
    rows,
    plantSpacing,
    pattern: plantingPattern,
  });

  const handlePresetChange = (selectedPreset: GridderPreset) => {
    setPreset(selectedPreset.id);
    setRows(selectedPreset.rows);
    setRowSpacing(selectedPreset.rowSpacing);
    setPlantSpacing(selectedPreset.plantSpacing);
  };

  const handleRowsChange = (value: number) => {
    setRows(Number.isFinite(value) ? Math.max(1, Math.floor(value)) : 1);
    setPreset("custom");
  };

  const handleRowSpacingChange = (value: number) => {
    setRowSpacing(
      Number.isFinite(value) ? Math.max(0.5, value) : 0.5
    );
    setPreset("custom");
  };

  const handlePlantSpacingChange = (value: number) => {
    setPlantSpacing(
      Number.isFinite(value) ? Math.max(0.5, value) : 0.5
    );
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
                setBedWidth(event.target.value);
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
              onChange={(event) =>
                setBedLength(event.target.value)
              }
              />
              <span>ft</span>
            </div>
          </div>
        </div>
      <div className="section-block">
        <div className="section-heading">
          <h2>Gridder Presets</h2>
          <p>Choose a standard Gridder pattern or customize the spacing below.</p>
        </div>
        <div className="preset-grid">
          {GRIDDER_PRESETS.map((gridderPreset) => (
            <button
              key={gridderPreset.id}
              type="button"
              className={
                preset === gridderPreset.id
                ? "preset-button active"
                : "preset-button"
              }
              aria-pressed={preset === gridderPreset.id}
              onClick={() => handlePresetChange(gridderPreset)}>
                <span className="preset-title">{gridderPreset.id}</span>

                <span className="preset-description">
                  {gridderPreset.rowSpacing}" ×{" "}
                  {gridderPreset.plantSpacing}"
                </span>
            </button>
          ))}
        </div>
      </div>

    <div className="section-block">
    <div className="section-heading">
      <h2>Manual Spacing</h2>
      <p>
      Adjust row and plant spacing independently.
      </p>
      {bedWidth.trim() !== "" && !rowsFit && (
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
    value={rows}
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
      handleRowSpacingChange(
        event.target.valueAsNumber
      )
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
    value={plantSpacing}
    onChange={(event) =>
      handlePlantSpacingChange(
        event.target.valueAsNumber
      )
    }
    />
    <span>in</span>
    </div>
    </div>
    </div>

    {preset === "custom" && (
      <div className="custom-spacing-note">
      Custom spacing
      </div>
    )}
    </div>

    <div className="section-block">
    <div className="section-heading">
    <h2>Planting Pattern</h2>
    <p>
    Plant every intersection or alternate positions
    on the fixed grid.
    </p>
    </div>

    <div className="pattern-options">
    <button
    type="button"
    className={
      plantingPattern === "standard"
      ? "pattern-button active"
      : "pattern-button"
    }
    aria-pressed={plantingPattern === "standard"}
    onClick={() => setPlantingPattern("standard")}
    >
    Full Grid
    </button>

    <button
    type="button"
    className={
      plantingPattern === "offset"
      ? "pattern-button active"
      : "pattern-button"
    }
    aria-pressed={plantingPattern === "offset"}
    onClick={() => setPlantingPattern("offset")}
    >
    Alternating Grid
    </button>
    </div>
    </div>

    <section className="results-card">
    <div className="result">
    <span className="result-label">
    Estimated plants
    </span>

    <strong className="result-value">
    {totalPlants.toLocaleString()}
    </strong>
    </div>

    <div className="result-details">
    <span>{rows} rows</span>
    <span>{rowSpacing}" row spacing</span>
    <span>{plantSpacing}" plant spacing</span>
    </div>
    </section>

    <PlantingPreview
      bedWidth={Number(bedWidth)}
      rows={rows}
      rowSpacing={rowSpacing}
      plantSpacing={plantSpacing}
      pattern={plantingPattern}
    />
    </section>
    </div>
  );
}

export default App;
