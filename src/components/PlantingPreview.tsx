type PlantingPattern = "standard" | "offset";

type PlantingPreviewProps = {
  bedWidth: number;
  rows: number;
  rowSpacing: number;
  plantSpacing: number;
  pattern: PlantingPattern;
};

export default function PlantingPreview({
  bedWidth,
  rows,
  rowSpacing,
  plantSpacing,
  pattern,
}: PlantingPreviewProps) {
  if (!Number.isFinite(bedWidth) || bedWidth <= 0) {
    return <p>Enter a valid bed width.</p>;
  }

  const bedLength = 60;

  const scale = 10;

  const previewWidth = bedLength * scale;
  const previewHeight = bedWidth * scale;

  const plantStepX = plantSpacing * scale;
  const rowStepY = rowSpacing * scale;

  const plantsPerRow = Math.max(1, Math.floor(bedLength / plantSpacing));

  const actualRowCount = Math.max(1, rows);

  const totalPlantWidth =
    plantsPerRow > 1 ? (plantsPerRow - 1) * plantStepX : 0;

  const totalRowHeight =
    actualRowCount > 1 ? (actualRowCount - 1) * rowStepY : 0;

  const startX = (previewWidth - totalPlantWidth) / 2;

  const startY = (previewHeight - totalRowHeight) / 2;

  const plants: { x: number; y: number }[] = [];

  for (let rowIndex = 0; rowIndex < rows; rowIndex++) {
    for (let plantIndex = 0; plantIndex < plantsPerRow; plantIndex++) {
      // Checkerboard planting pattern
      if (pattern === "offset" && (rowIndex + plantIndex) % 2 !== 0) {
        continue;
      }

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
          <p>{bedWidth}" bed × 60" preview section</p>
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
          aria-label={`Planting preview with ${rows} rows`}
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
        <span>{plantsPerRow} grid positions per row</span>
        <span>{plants.length} plants in preview</span>
      </div>
    </section>
  );
}
