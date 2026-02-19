import { ScriptOnce } from "@tanstack/react-router";
import { createClientOnlyFn, createIsomorphicFn } from "@tanstack/react-start";
import darkThemeUrl from "highlight.js/styles/github-dark.css?url";
import lightThemeUrl from "highlight.js/styles/github.css?url";
import { useEffect } from "react";
import { z } from "zod";

const themeStorageKey = "user-theme" as const;

const UserThemeSchema = z.enum(["light", "dark", "system"]).catch("system");
const AppThemeSchema = z.enum(["light", "dark"]).catch("light");

export type UserTheme = z.infer<typeof UserThemeSchema>;
export type AppTheme = z.infer<typeof AppThemeSchema>;

const HIGHLIGHT_THEME = {
  dark: darkThemeUrl,
  light: lightThemeUrl
} as const;

const updateHightlightTheme = createClientOnlyFn((theme: AppTheme) => {
  let linkTag = document.getElementById("highlight-theme") as HTMLLinkElement | null;

  if (!linkTag) {
    linkTag = document.createElement("link");
    linkTag.id = "highlight-theme";
    linkTag.rel = "stylesheet";
    document.head.appendChild(linkTag);
  }

  linkTag.href = HIGHLIGHT_THEME[theme];
});

const getMediaQuery = createClientOnlyFn(() => {
  return window.matchMedia("(prefers-color-scheme: dark)");
});

export const getUserTheme = createIsomorphicFn()
  .server((): UserTheme => "system")
  .client((): UserTheme => {
    const storedTheme = localStorage.getItem(themeStorageKey);
    return UserThemeSchema.parse(storedTheme);
  });

export const getAppTheme = createClientOnlyFn((theme: UserTheme) => {
  const systemTheme = getMediaQuery().matches ? "dark" : "light";
  return theme === "system" ? systemTheme : theme;
});

export const setUserTheme = createClientOnlyFn((theme: UserTheme) => {
  const validatedTheme = UserThemeSchema.parse(theme);
  localStorage.setItem(themeStorageKey, validatedTheme);
});

export const handleThemeChange = createClientOnlyFn((theme: UserTheme) => {
  const appTheme = getAppTheme(theme);

  setUserTheme(theme);
  updateHightlightTheme(appTheme);

  document.documentElement.classList[appTheme === "dark" ? "add" : "remove"]("dark");
});

const setupPreferredListener = () => {
  if (getUserTheme() !== "system") return;

  const mediaQuery = getMediaQuery();
  const handler = () => handleThemeChange("system");

  mediaQuery.addEventListener("change", handler);
  return () => mediaQuery.removeEventListener("change", handler);
};

/**
 * Custom script with duplicated logic, used for SSR
 */
const getThemeScript = () => {
  function themeFn() {
    const storedTheme = localStorage.getItem("user-theme" satisfies typeof themeStorageKey);
    const isStoredValid = storedTheme && ["light", "dark", "system"].includes(storedTheme);

    const theme = isStoredValid ? storedTheme : "system";

    const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");
    const systemTheme = mediaQuery.matches ? "dark" : "light";

    const resolvedTheme = theme === "system" ? systemTheme : theme;
    document.documentElement.classList[resolvedTheme === "dark" ? "add" : "remove"]("dark");
  }
  return `(${themeFn.toString()})();`;
};

export const ThemeScript = () => {
  const scriptString = getThemeScript();
  useEffect(setupPreferredListener, []);
  return <ScriptOnce>{scriptString}</ScriptOnce>;
};

// TODO: Probably need to change to use cookie to prevent hydration mismatch, but for now this is good enough
