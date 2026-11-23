import { en } from "./en";
import { ja } from "./ja";

export const translations = {
  en,
  ja,
};

export type Language = keyof typeof translations;

export function getTranslations(language: Language) {
  return translations[language];
}
