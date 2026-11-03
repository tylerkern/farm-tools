
export const GRIDDER_PRESETS = {
    '2x2': { rows: 2, spacing: 15 },
    '3x3': { rows: 3, spacing: 10 },
    '4x4': { rows: 4, spacing: 7.5 },
    '5x5': { rows: 5, spacing: 6 },
} as const

export type GridderPreset = keyof typeof GRIDDER_PRESETS
