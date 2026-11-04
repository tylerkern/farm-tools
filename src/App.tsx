import { useMemo, useState } from "react";
import "./App.css";

type GridderPreset = {
  id: string;
  label: string;
  rows: number;
  rowSpacing: number;
  plantSpacing: number;
};

const GRIDDER_PRESETS: GridderPreset[] = [
  {
    id: "2x2",
    label: '2 × 2 — 15"',
    rows: 2,
    rowSpacing: 15,
    plantSpacing: 15,
  },
{
  id: "3x3",
  label: '3 × 3 — 10"',
  rows: 3,
  rowSpacing: 10,
  plantSpacing: 10,
},
{
  id: "4x4",
  label: '4 × 4 — 7.5"',
  rows: 4,
  rowSpacing: 7.5,
  plantSpacing: 7.5,
},
{
  id: "5x5",
  label: '5 × 5 — 6"',
  rows: 5,
  rowSpacing: 6,
  plantSpacing: 6,
},
];

type PlantingPreviewProps = {
  rows: number;
  rowSpacing: number;
  plantSpacing: number;
};

function PlantingPreview({
  rows,
  rowSpacing,
  plantSpacing,
}: PlantingPreviewProps) {
  const bedWidth = 30;
  const bedLength = 60;

  // Same physical scale for both axes so the preview stays proportional.
  const scale = 8;

  const previewWidth = bedLength * scale;
  const previewHeight = bedWidth * scale;

  const plantStepX = plantSpacing * scale;
  const rowStepY = rowSpacing * scale;

  const plantsPerRow = Math.max(
    1,
    Math.floor(bedLength / plantSpacing)
  );

  const totalPlantWidth =
  plantsPerRow > 1
  ? (plantsPerRow - 1) * plantStepX
  : 0;

  const totalRowHeight =
  rows > 1
  ? (rows - 1) * rowStepY
  : 0;

  const startX =
  (previewWidth - totalPlantWidth) / 2;

  const startY =
  (previewHeight - totalRowHeight) / 2;

  const plants: { x: number; y: number }[] = [];

  for (let rowIndex = 0; rowIndex < rows; rowIndex++) {
    for (
      let plantIndex = 0;
    plantIndex < plantsPerRow;
    plantIndex++
    ) {
      plants.push({
        x: startX + plantIndex * plantStepX,
        y: startY + rowIndex * rowStepY,
      });
    }
  }

  return (
    <section className="preview-card">
    <div className="preview-header">
    <div>
    <h2>Planting Preview</h2>
    <p>
    30" bed × 60" preview section
    </p>
    </div>

    <div className="preview-spacing-label">
    {rowSpacing}" rows × {plantSpacing}" plants
    </div>
    </div>

    <div className="preview-wrapper">
    <svg
    viewBox={`0 0 ${previewWidth} ${previewHeight}`}
    className="planting-preview"
    role="img"
    aria-label={`Preview showing ${rows} rows with ${rowSpacing} inch row spacing and ${plantSpacing} inch plant spacing`}
    >
    <rect
    x="0"
    y="0"
    width={previewWidth}
    height={previewHeight}
    rx="12"
    className="bed-background"
    />

    {plants.map((plant, index) => (
      <circle
      key={index}
      cx={plant.x}
      cy={plant.y}
      r="7"
      className="plant-dot"
      />
    ))}
    </svg>
    </div>

    <div className="preview-footer">
    <span>{rows} rows</span>
    <span>{plantsPerRow} plants per row</span>
    <span>
    {rows * plantsPerRow} plants in preview
    </span>
    </div>
    </section>
  );
}

function App() {
  const [bedLength, setBedLength] = useState(100);
  const [rows, setRows] = useState(3);

  const [rowSpacing, setRowSpacing] = useState(10);
  const [plantSpacing, setPlantSpacing] = useState(10);

  const [preset, setPreset] = useState("3x3");

  const totalPlants = useMemo(() => {
    if (
      bedLength <= 0 ||
      rows <= 0 ||
      plantSpacing <= 0
    ) {
      return 0;
    }

    const bedLengthInches = bedLength * 12;

    const plantsPerRow = Math.floor(
      bedLengthInches / plantSpacing
    );

    return plantsPerRow * rows;
  }, [bedLength, rows, plantSpacing]);

  const handlePresetChange = (
    selectedPreset: GridderPreset
  ) => {
    setPreset(selectedPreset.id);
    setRows(selectedPreset.rows);
    setRowSpacing(selectedPreset.rowSpacing);
    setPlantSpacing(selectedPreset.plantSpacing);
  };

  const handleRowsChange = (
    value: number
  ) => {
    setRows(Math.max(1, value));
    setPreset("custom");
  };

  const handleRowSpacingChange = (
    value: number
  ) => {
    setRowSpacing(Math.max(0.5, value));
    setPreset("custom");
  };

  const handlePlantSpacingChange = (
    value: number
  ) => {
    setPlantSpacing(Math.max(0.5, value));
    setPreset("custom");
  };

  return (
    <div className="calculator-page">
    <section className="calculator-card">
    <div className="calculator-heading">
    <div>
    <h1>Transplant Calculator</h1>
    <p>
    Estimate plant counts and visualize your
    spacing.
    </p>
    </div>
    </div>

    <div className="form-grid">
    <div className="field">
    <label htmlFor="bedLength">
    Bed length
    </label>

    <div className="input-with-unit">
    <input
    id="bedLength"
    type="number"
    min="1"
    step="1"
    value={bedLength}
    onChange={(event) =>
      setBedLength(
        Math.max(
          1,
          Number(event.target.value)
        )
      )
    }
    />

    <span>ft</span>
    </div>
    </div>
    </div>

    <div className="section-block">
    <div className="section-heading">
    <h2>Gridder Presets</h2>
    <p>
    Choose a standard Gridder pattern or
    customize the spacing below.
    </p>
    </div>

    <div className="preset-grid">
    {GRIDDER_PRESETS.map(
      (gridderPreset) => (
        <button
        key={gridderPreset.id}
        type="button"
        className={
          preset === gridderPreset.id
          ? "preset-button active"
          : "preset-button"
        }
        onClick={() =>
          handlePresetChange(
            gridderPreset
          )
        }
        >
        <span className="preset-title">
        {gridderPreset.id}
        </span>

        <span className="preset-description">
        {
          gridderPreset.rowSpacing
        }
        " ×{" "}
        {
          gridderPreset.plantSpacing
        }
        "
        </span>
        </button>
      )
    )}
    </div>
    </div>

    <div className="section-block">
    <div className="section-heading">
    <h2>Manual Spacing</h2>
    <p>
    Adjust row and plant spacing independently.
    </p>
    </div>

    <div className="spacing-controls">
    <div className="field">
    <label htmlFor="rows">
    Number of rows
    </label>

    <input
    id="rows"
    type="number"
    min="1"
    step="1"
    value={rows}
    onChange={(event) =>
      handleRowsChange(
        Number(event.target.value)
      )
    }
    />
    </div>

    <div className="field">
    <label htmlFor="rowSpacing">
    Row spacing
    </label>

    <div className="input-with-unit">
    <input
    id="rowSpacing"
    type="number"
    min="0.5"
    step="0.5"
    value={rowSpacing}
    onChange={(event) =>
      handleRowSpacingChange(
        Number(event.target.value)
      )
    }
    />

    <span>in</span>
    </div>
    </div>

    <div className="field">
    <label htmlFor="plantSpacing">
    Plant spacing
    </label>

    <div className="input-with-unit">
    <input
    id="plantSpacing"
    type="number"
    min="0.5"
    step="0.5"
    value={plantSpacing}
    onChange={(event) =>
      handlePlantSpacingChange(
        Number(event.target.value)
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

    <span>
    {rowSpacing}" row spacing
    </span>

    <span>
    {plantSpacing}" plant spacing
    </span>
    </div>
    </section>

    <PlantingPreview
    rows={rows}
    rowSpacing={rowSpacing}
    plantSpacing={plantSpacing}
    />
    </section>
    </div>
  );
}

export default App;
