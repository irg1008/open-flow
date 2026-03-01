import { createServerFn } from "@tanstack/react-start";
import { getCookie, setCookie } from "@tanstack/react-start/server";
import darkThemeUrl from "highlight.js/styles/github-dark.css?url";
import lightThemeUrl from "highlight.js/styles/github.css?url";
import { useEffect } from "react";
import { z } from "zod";
import { FunctionOnce } from "./function-once";

const UserThemeSchema = z.enum(["light", "dark", "system"]).catch("system");
const AppThemeSchema = z.enum(["light", "dark"]).catch("light");

type UserTheme = z.infer<typeof UserThemeSchema>;
type AppTheme = z.infer<typeof AppThemeSchema>;

// Server

const cookieName = "ui-theme";

export const getStoredTheme = createServerFn({ method: "GET" }).handler(async () => {
  const cookieTheme = getCookie(cookieName);
  return UserThemeSchema.parse(cookieTheme);
});

const setStoredTheme = createServerFn({ method: "POST" })
  .inputValidator(UserThemeSchema)
  .handler(async ({ data }) => setCookie(cookieName, data));

// Code highlight css

const highlightTheme = {
  dark: darkThemeUrl,
  light: lightThemeUrl,
  update(theme: AppTheme) {
    let linkTag = document.getElementById("highlight-theme") as HTMLLinkElement | null;

    if (!linkTag) {
      linkTag = document.createElement("link");
      linkTag.id = "highlight-theme";
      linkTag.rel = "stylesheet";
      document.head.appendChild(linkTag);
    }

    linkTag.href = highlightTheme[theme];
  }
};

// Picture source handling

export const setNeutralPictureSource = (sourceEl: Element) => {
  const alreadySet = sourceEl.getAttribute("data-theme");
  if (alreadySet) return;

  const theme = document.documentElement.classList.contains("dark") ? "dark" : "light";
  const sourceTheme =
    sourceEl.getAttribute("media") === "(prefers-color-scheme: dark)" ? "dark" : "light";

  sourceEl.setAttribute("data-theme", sourceTheme);
  sourceEl.setAttribute("media", theme === sourceTheme ? "all" : "not all");
};

const updatePictureSource = (theme: AppTheme) => {
  const themeMedia = document.querySelectorAll(`source[data-theme="${theme}"]`);
  const nonThemeMedia = document.querySelectorAll(`source:not([data-theme="${theme}"])`);

  themeMedia.forEach((source) => source.setAttribute("media", "all"));
  nonThemeMedia.forEach((source) => source.setAttribute("media", "not all"));
};

// Client

const getSystemTheme = () => {
  const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");
  return mediaQuery.matches ? "dark" : "light";
};

const setRootTheme = (theme: UserTheme) => {
  const root = document.documentElement;
  root.classList.remove("light", "dark");

  const newTheme = theme === "system" ? getSystemTheme() : theme;
  root.classList.add(newTheme);

  highlightTheme.update(newTheme);
  updatePictureSource(newTheme);
};

const setupPreferredListener = () => {
  const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");
  const handler = () => setRootTheme("system");
  mediaQuery.addEventListener("change", handler);
  return () => mediaQuery.removeEventListener("change", handler);
};

// Needed SSR script and global setter

export const setTheme = async (theme: UserTheme) => {
  setRootTheme(theme);
  await setStoredTheme({ data: theme });
};

export const ThemeScript = ({ initialTheme }: { initialTheme: UserTheme }) => {
  useEffect(() => {
    setRootTheme(initialTheme);

    if (initialTheme !== "system") return;
    return setupPreferredListener();
  }, [initialTheme]);

  /**
   * Need to duplciate logic to serialize in server
   */
  function themeFn(theme: UserTheme) {
    const root = document.documentElement;

    if (theme !== "system") {
      root.className = theme;
      return;
    }

    const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");
    const systemTheme = mediaQuery.matches ? "dark" : "light";
    root.className = systemTheme;
  }

  return <FunctionOnce param={initialTheme}>{themeFn}</FunctionOnce>;
};
