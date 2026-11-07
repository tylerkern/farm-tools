
export type PlantingPattern = "standard" | "offset";

export interface PlantingInputs {
    bedLength: number; // feet
    rows: number;
    plantSpacing: number; // inches
    pattern: PlantingPattern;
}

export function calculatePlants({
    bedLength,
    rows,
    plantSpacing,
    pattern,
}: PlantingInputs): number {
    if (
        !Number.isFinite(bedLength) ||
        !Number.isInteger(rows) ||
        !Number.isFinite(plantSpacing) ||
        bedLength <= 0 ||
        rows <= 0 ||
        plantSpacing <= 0
    ) {
        return 0;
    }

    const plantsPerRow = Math.floor(
        (bedLength * 12) / plantSpacing
    );

    const totalPositions = plantsPerRow * rows;

    return pattern === "offset"
    ? Math.ceil(totalPositions / 2)
    : totalPositions;
}
