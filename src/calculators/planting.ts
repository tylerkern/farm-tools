
export interface PlantingInputs {
    bedLength: number
    rows: number
    spacing: number
}

export function calculatePlants({
    bedLength,
    rows,
    spacing,
}: PlantingInputs): number {
    if (
        !Number.isFinite(bedLength) ||
        !Number.isInteger(rows) ||
        !Number.isFinite(spacing) ||
        bedLength <= 0 ||
        rows <= 0 ||
        spacing <= 0
    ) {
        return 0
    }

    const inchesPerRow = bedLength * 12
    const plantsPerRow = Math.floor(inchesPerRow / spacing)

    return plantsPerRow * rows
}
