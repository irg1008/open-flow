import { Locale } from "./_generated/runtime";

const localeFormatters = new Map<Locale, Intl.DisplayNames>();

export const getCountryName = (locale: Locale): string => {
  let formatter = localeFormatters.get(locale);

  if (!formatter) {
    formatter = new Intl.DisplayNames([locale], { type: "language" });
    localeFormatters.set(locale, formatter);
  }

  return formatter.of(locale) || locale;
};
