import { getTranslations, type Language } from "../i18n";
import { truncateToTwoDeicmals } from "../utils/format";
import { centimetersToInches, type UnitSystem } from "../utils/units";
import type { TransplantingPattern } from "../calculators/transplanting";
import {
  calculateTransplantPositions,
  PREVIEW_LENGTH_CM,
} from "../calculators/transplantGeometry";

type TransplantingPreviewProps = {
  bedWidthCm: number;
  rowCount: number;
  rowSpacingCm: number;
  plantSpacingCm: number;
  pattern: TransplantingPattern;
  unitSystem: UnitSystem;
  language: Language;
};

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
  language,
}: TransplantingPreviewProps) {
  const t = getTranslations(language);
  const geometry = calculateTransplantPositions({
    bedWidthCm,
    rowCount,
    rowSpacingCm,
    plantSpacingCm,
    pattern,
  });

  if (!geometry.valid) {
    return <p>{t.invalidPreview}</p>;
  }

  return (
    <section className="preview-card">
      <div className="preview-header">
        <div>
          <h2>{t.preview}</h2>
          <p>
            {formatMeasurement(bedWidthCm, unitSystem)} {t.bed} ×{" "}
            {formatMeasurement(PREVIEW_LENGTH_CM, unitSystem)} {t.previewSection}
          </p>
        </div>
        <div className="preview-spacing-label">
          {formatMeasurement(rowSpacingCm, unitSystem)} {t.rowSpacing} ×{" "}
          {formatMeasurement(plantSpacingCm, unitSystem)} {t.inRowSpacing}
        </div>
      </div>

      <div className="preview-wrapper">
        <svg
          viewBox={`0 0 ${geometry.bedLengthCm} ${geometry.bedWidthCm}`}
          className="planting-preview"
          role="img"
          aria-label={t.previewAria.replace("{rows}", String(rowCount))}
        >
          <rect
            x="0"
            y="0"
            width={geometry.bedLengthCm}
            height={geometry.bedWidthCm}
            rx="3"
            className="bed-background"
          />
          {geometry.positions.map((plant) => (
            <circle
              key={plant.key}
              cx={plant.xCm}
              cy={plant.yCm}
              r="1.75"
              className="plant-dot"
            />
          ))}
        </svg>
      </div>

      {geometry.tooDense ? (
        <p>{t.previewTooDense}</p>
      ) : (
        <div className="preview-footer">
          <span>{rowCount} {t.rows}</span>
          <span>{geometry.positionsPerRow} {t.gridPositionsPerRow}</span>
          <span>{geometry.positions.length} {t.plantsInPreview}</span>
        </div>
      )}
    </section>
  );
}
