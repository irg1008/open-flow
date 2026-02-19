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

const updateHightlightTheme = (theme: AppTheme) => {
  let linkTag = document.getElementById("highlight-theme") as HTMLLinkElement | null;

  if (!linkTag) {
    linkTag = document.createElement("link");
    linkTag.id = "highlight-theme";
    linkTag.rel = "stylesheet";
    document.head.appendChild(linkTag);
  }

  linkTag.href = HIGHLIGHT_THEME[theme];
};

const getMediaQuery = createClientOnlyFn(() => {
  return window.matchMedia("(prefers-color-scheme: dark)");
});

export const getTheme = createIsomorphicFn()
  .server((): UserTheme => "system")
  .client(() => {
    const storedTheme = localStorage.getItem(themeStorageKey);
    return UserThemeSchema.parse(storedTheme);
  });

export const setTheme = createClientOnlyFn((theme: UserTheme) => {
  const validatedTheme = UserThemeSchema.parse(theme);
  localStorage.setItem(themeStorageKey, validatedTheme);
});

export const handleThemeChange = createClientOnlyFn((theme: UserTheme) => {
  const systemTheme = getMediaQuery().matches ? "dark" : "light";
  const resolvedTheme = theme === "system" ? systemTheme : theme;

  document.documentElement.classList[resolvedTheme === "dark" ? "add" : "remove"]("dark");
  document.documentElement.classList[theme === "system" ? "add" : "remove"]("system");

  setTheme(theme);
  updateHightlightTheme(resolvedTheme);
});

// Custom script with duplicated logic, used for SSR

const getThemeScript = () => {
  function themeFn() {
    const storedTheme = localStorage.getItem("user-theme" satisfies typeof themeStorageKey);

    const theme =
      storedTheme && ["light", "dark", "system"].includes(storedTheme) ? storedTheme : "system";

    const systemTheme = window.matchMedia("(prefers-color-scheme: dark)").matches
      ? "dark"
      : "light";

    const resolvedTheme = theme === "system" ? systemTheme : theme;
    document.documentElement.classList[resolvedTheme === "dark" ? "add" : "remove"]("dark");
    document.documentElement.classList[theme === "system" ? "add" : "remove"]("system");
  }
  return `(${themeFn.toString()})();`;
};

const setupPreferredListener = () => {
  const mediaQuery = getMediaQuery();
  const handler = () => handleThemeChange("system");

  mediaQuery.addEventListener("change", handler);
  return () => mediaQuery.removeEventListener("change", handler);
};

export const ThemeScript = () => {
  useEffect(setupPreferredListener, []);
  return <ScriptOnce>{getThemeScript()}</ScriptOnce>;
};
