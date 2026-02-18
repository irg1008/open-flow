import en from "@/i18n/en.json";
import es from "@/i18n/es.json";

export const locales = ["en", "es"] as const;

export type Locale = (typeof locales)[number];

export const localeNames: Record<Locale, string> = {
  en: "English",
  es: "Español"
};

export const defaultLocale: Locale = "en";
export const localeCookieName = "locale";

export const dictionaries: Record<Locale, Record<string, unknown>> = {
  en,
  es
};
