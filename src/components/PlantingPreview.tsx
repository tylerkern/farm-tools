
interface PlantingPreviewProps {
    rows: number
    spacing: number
}

export default function PlantingPreview({
    rows,
    spacing,
}: PlantingPreviewProps) {
    const bedLength = 60 // inches
    const bedWidth = 30 // inches

    if (
        !Number.isInteger(rows) ||
        rows < 1 ||
        rows > 20 ||
        !Number.isFinite(spacing) ||
        spacing <= 0
    ) {
        return <p>Enter valid planting dimensions.</p>
    }

    const plantsPerRow = Math.floor(bedLength / spacing)

    // One SVG unit per inch
    const scale = 8
    const padding = 20

    const width = bedLength * scale + padding * 2
    const height = bedWidth * scale + padding * 2

    // Center the planting rows across the bed
    const plantedWidth = (rows - 1) * spacing
    const rowOffset = (bedWidth - plantedWidth) / 2

    return (
        <div className="planting-preview">
        <h3>Planting Layout</h3>
        <p>First 5 feet of a 30-inch bed</p>

        <svg
        viewBox={`0 0 ${width} ${height}`}
        role="img"
        aria-label={`${rows} rows with ${spacing} inch spacing`}
        >
        <rect
        x={padding}
        y={padding}
        width={bedLength * scale}
        height={bedWidth * scale}
        rx="8"
        fill="#e9dfce"
        />

        {Array.from({ length: rows }, (_, row) =>
        Array.from(
            { length: plantsPerRow },
            (_, col) => {
                const x =
                padding + (col + 0.5) * spacing * scale

                const y =
                padding +
                (rowOffset + row * spacing) * scale

                return (
                    <circle
                    key={`${row}-${col}`}
                    cx={x}
                    cy={y}
                    r="5"
                    fill="#4d9d42"
                    />
                )
            },
        ),
        )}
        </svg>

        <p>{plantsPerRow * rows} plants in this section</p>
        </div>
    )
}
