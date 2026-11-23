import type { TranslationKey } from "./en";

export const ja = {
  title: "定植計算ツール",
  description: "必要な苗の数を計算し、定植間隔を確認できます。",

  bedDetails: "畝の寸法",
  bedDetailsDescription: "畝の幅と長さを入力してください。",
  bedWidth: "畝幅",
  bedLength: "畝の長さ",

  imperial: "ヤード・ポンド法",
  metric: "メートル法",
  reset: "初期設定に戻す",

  gridPresets: "グリッド設定",
  gridPresetsDescription: "グリッドを選択するか、下で間隔を調整してください。",

  manualSpacing: "間隔の調整",
  manualSpacingDescription: "条間と列内の間隔を個別に設定できます。",

  rowCount: "列数",
  rowSpacing: "条間",
  inRowSpacing: "列内間隔",
  customSpacing: "カスタム設定",

  pattern: "配置パターン",
  patternDescription:
    "間隔はグリッドの基準値です。交互配置では、一つおきの位置に定植します。",
  fullGrid: "全点配置",
  alternatingGrid: "交互配置",

  estimatedPlants: "必要な苗の数",
  preview: "プレビュー",
  previewSection: "の表示範囲",
  gridPositionsPerRow: "各列のグリッド位置数",
  plantsInPreview: "表示範囲内の苗数",

  invalidBedWidth: "有効な畝幅を入力してください。",
  invalidBedLength: "有効な畝の長さを入力してください。",
  invalidSpacing: "有効な間隔を入力してください。",
  rowsDoNotFit: "指定した条間と列数では畝幅に収まりません。",
} satisfies Record<TranslationKey, string>;
