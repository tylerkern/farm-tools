import { truncateToTwoDeicmals } from "../utils/format";
import { centimetersToInches, type UnitSystem } from "../utils/units";
import type { TransplantingPattern } from "../calculators/transplanting";

type TransplantingPreviewProps = {
  bedWidthCm: number;
  rowCount: number;
  rowSpacingCm: number;
  plantSpacingCm: number;
  pattern: TransplantingPattern;
  unitSystem: UnitSystem;
};

// Show a fixed 60-inch section of bed, regardless of the selected units.
const PREVIEW_LENGTH_CM = 152.4;
const PIXELS_PER_CM = 4;
const MAX_PREVIEW_DOTS = 1500;

function formatMeasurement(cm: number, unitSystem: UnitSystem): string {
  const value = unitSystem === "imperial" ? centimetersToInches(cm) : cm;
  const unit = unitSystem === "imperial" ? '"' : " cm";
  return `${truncateToTwoDeicmals(value)}${unit}`;
}

export default function TransplantingPreview({
  bedWidthCm,
  rowCount,
  rowSpacingCm,
  plantSpacingCm,
  pattern,
  unitSystem,
}: TransplantingPreviewProps) {
  if (
    !Number.isFinite(bedWidthCm) ||
    bedWidthCm <= 0 ||
    !Number.isInteger(rowCount) ||
    rowCount <= 0 ||
    !Number.isFinite(rowSpacingCm) ||
    rowSpacingCm <= 0 ||
    !Number.isFinite(plantSpacingCm) ||
    plantSpacingCm <= 0
  ) {
    return <p>Enter valid bed dimensions and spacing to see the preview.</p>;
  }

  // One common scale preserves the real proportions of the bed and grid.
  const previewWidth = PREVIEW_LENGTH_CM * PIXELS_PER_CM;
  const previewHeight = bedWidthCm * PIXELS_PER_CM;

  // Match the transplant count's approach to full spacing intervals.
  const ratio = PREVIEW_LENGTH_CM / plantSpacingCm;
  const plantsPerRow = Math.floor(
    ratio + Number.EPSILON * Math.max(1, Math.abs(ratio)) * 4,
  );
  const gridPositions = plantsPerRow * rowCount;
  const tooDense = gridPositions > MAX_PREVIEW_DOTS;

  const plantStepX = plantSpacingCm * PIXELS_PER_CM;
  const rowStepY = rowSpacingCm * PIXELS_PER_CM;

  const totalPlantWidth = Math.max(0, plantsPerRow - 1) * plantStepX;
  const totalRowHeight = (rowCount - 1) * rowStepY;
  const startX = (previewWidth - totalPlantWidth) / 2;
  const startY = (previewHeight - totalRowHeight) / 2;

  const plants: { x: number; y: number; key: string }[] = [];

  if (!tooDense) {
    for (let rowIndex = 0; rowIndex < rowCount; rowIndex++) {
      for (let plantIndex = 0; plantIndex < plantsPerRow; plantIndex++) {
        if (pattern === "offset" && (rowIndex + plantIndex) % 2 !== 0) {
          continue;
        }

        plants.push({
          key: `${rowIndex}-${plantIndex}`,
          x: startX + plantIndex * plantStepX,
          y: startY + rowIndex * rowStepY,
        });
      }
    }
  }

  return (
    <section className="preview-card">
      <div className="preview-header">
        <div>
          <h2>Preview</h2>
          <p>
            {formatMeasurement(bedWidthCm, unitSystem)} bed ×{" "}
            {formatMeasurement(PREVIEW_LENGTH_CM, unitSystem)} preview section
          </p>
        </div>

        <div className="preview-spacing-label">
          {formatMeasurement(rowSpacingCm, unitSystem)} rows ×{" "}
          {formatMeasurement(plantSpacingCm, unitSystem)} plants
        </div>
      </div>

      <div className="preview-wrapper">
        <svg
          viewBox={`0 0 ${previewWidth} ${previewHeight}`}
          className="planting-preview"
          role="img"
          aria-label={`Transplanting preview with ${rowCount} rows`}
        >
          <rect
            x="0"
            y="0"
            width={previewWidth}
            height={previewHeight}
            rx="12"
            className="bed-background"
          />
          {plants.map((plant) => (
            <circle
              key={plant.key}
              cx={plant.x}
              cy={plant.y}
              r="7"
              className="plant-dot"
            />
          ))}
        </svg>
      </div>

      {tooDense ? (
        <p>Spacing is too dense to display individual plants in the preview.</p>
      ) : (
        <div className="preview-footer">
          <span>{rowCount} rows</span>
          <span>{plantsPerRow} grid positions per row</span>
          <span>{plants.length} plants in preview</span>
        </div>
      )}
    </section>
  );
}
