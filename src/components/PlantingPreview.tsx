type PlantingPreviewProps = {
    rows: number;
    rowSpacing: number;
    plantSpacing: number;
};

export default function PlantingPreview({
    rows,
    rowSpacing,
    plantSpacing,
}: PlantingPreviewProps) {
    const bedLength = 60;
    const bedWidth = 30;

    const previewWidth = 600;
    const previewHeight = 300;

    const scaleX = previewWidth / bedLength;
    const scaleY = previewHeight / bedWidth;

    const plantStepX = plantSpacing * scaleX;
    const rowStepY = rowSpacing * scaleY;

    const plantsPerRow = Math.max(
        1,
        Math.floor(bedLength / plantSpacing)
    );

    const actualRowCount = Math.max(1, rows);

    const totalPlantWidth =
    plantsPerRow > 1
    ? (plantsPerRow - 1) * plantStepX
    : 0;

    const totalRowHeight =
    actualRowCount > 1
    ? (actualRowCount - 1) * rowStepY
    : 0;

    const startX =
    (previewWidth - totalPlantWidth) / 2;

    const startY =
    (previewHeight - totalRowHeight) / 2;

    const plants = [];

    for (let rowIndex = 0; rowIndex < actualRowCount; rowIndex++) {
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
        <div className="planting-preview">
        <div className="preview-header">
        <div>
        <strong>Planting preview</strong>
        </div>

        <div className="preview-spacing">
        {rowSpacing}" rows × {plantSpacing}" plants
        </div>
        </div>

        <svg
        viewBox={`0 0 ${previewWidth} ${previewHeight}`}
        className="preview-svg"
        role="img"
        aria-label={`Planting pattern with ${rowSpacing} inch row spacing and ${plantSpacing} inch plant spacing`}
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
            r="6"
            className="plant-dot"
            />
        ))}
        </svg>

        <div className="preview-footer">
        <span>{actualRowCount} rows</span>
        <span>{plantsPerRow} plants per row</span>
        </div>
        </div>
    );
}
