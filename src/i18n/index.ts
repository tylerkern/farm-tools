import { en } from "./en";
import { ja } from "./ja";

export const translations = { en, ja };
export type Language = keyof typeof translations;
export type Translations = Record<keyof typeof en, string>;

export function getTranslations(language: Language): Translations {
  return translations[language];
}
