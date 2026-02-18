import {
  defaultLocale,
  dictionaries,
  localeCookieName,
  localeNames,
  locales,
  type Locale
} from "@/i18n/config";
import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  type PropsWithChildren
} from "react";

type LocaleChangeOptions = {
  redirect?: boolean;
};

type I18nContextValue = {
  locale: Locale;
  t: (key: string, params?: Record<string, string>) => string;
  setLocale: (locale: string, options?: LocaleChangeOptions) => Promise<void>;
};

const I18nContext = createContext<I18nContextValue | null>(null);

function normalizeLocale(value?: string): Locale {
  if (!value) return defaultLocale;
  return (locales as readonly string[]).includes(value) ? (value as Locale) : defaultLocale;
}

function getValueFromKey(dictionary: Record<string, unknown>, key: string): string | undefined {
  const value = key.split(".").reduce<unknown>((current, part) => {
    if (!current || typeof current !== "object") return undefined;
    return (current as Record<string, unknown>)[part];
  }, dictionary);

  return typeof value === "string" ? value : undefined;
}

function formatMessage(template: string, params?: Record<string, string>) {
  if (!params) return template;
  return template.replace(
    /\{(\w+)\}/g,
    (_, paramName: string) => params[paramName] ?? `{${paramName}}`
  );
}

export function I18nProvider({
  children,
  initialLocale
}: PropsWithChildren<{ initialLocale?: string }>) {
  const [locale, setLocaleState] = useState<Locale>(normalizeLocale(initialLocale));

  const dictionary = dictionaries[locale] ?? dictionaries[defaultLocale];

  const t = useCallback(
    (key: string, params?: Record<string, string>) => {
      const translation = getValueFromKey(dictionary, key);
      return formatMessage(translation ?? key, params);
    },
    [dictionary]
  );

  const setLocale = useCallback(async (nextLocale: string, _options?: LocaleChangeOptions) => {
    const normalized = normalizeLocale(nextLocale);
    setLocaleState(normalized);
    if (typeof document !== "undefined") {
      document.cookie = `${localeCookieName}=${normalized}; path=/; max-age=31536000; samesite=lax`;
    }
    if (typeof localStorage !== "undefined") {
      localStorage.setItem(localeCookieName, normalized);
    }
  }, []);

  const value = useMemo(
    () => ({
      locale,
      t,
      setLocale
    }),
    [locale, setLocale, t]
  );

  return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>;
}

export function useI18n() {
  const context = useContext(I18nContext);
  if (!context) throw new Error("useI18n must be used within an I18nProvider");
  return context;
}

export { localeNames, locales };
