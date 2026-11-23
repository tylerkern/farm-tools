export const en = {
  title: "Transplant Calculator",
  description: "Estimate plant counts and visualize your spacing.",

  bedDetails: "Bed Details",
  bedDetailsDescription: "Enter your bed dimensions.",
  bedWidth: "Bed width",
  bedLength: "Bed length",

  imperial: "Imperial",
  metric: "Metric",
  reset: "Reset to Defaults",

  gridPresets: "Grid Presets",
  gridPresetsDescription:
    "Choose a standard grid pattern or customize the spacing below.",

  manualSpacing: "Manual Spacing",
  manualSpacingDescription: "Adjust row and in-row spacing independently.",

  rowCount: "Number of rows",
  rowSpacing: "Row spacing",
  inRowSpacing: "In-row spacing",
  customSpacing: "Custom spacing",

  pattern: "Pattern",
  patternDescription:
    "Spacing defines the underlying grid. Alternating Grid skips every other position.",
  fullGrid: "Full Grid",
  alternatingGrid: "Alternating Grid",

  estimatedPlants: "Estimated plants",
  preview: "Preview",
  previewSection: "preview section",
  gridPositionsPerRow: "grid positions per row",
  plantsInPreview: "plants in preview",

  invalidBedWidth: "Enter a valid bed width.",
  invalidBedLength: "Enter a valid bed length.",
  invalidSpacing: "Enter a valid spacing.",
  rowsDoNotFit: "These rows won't fit within the selected bed width.",
} as const;

export type TranslationKey = keyof typeof en;
