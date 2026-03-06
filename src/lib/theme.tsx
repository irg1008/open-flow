import { createClientOnlyFn, createServerFn } from "@tanstack/react-start";
import { getCookie, setCookie } from "@tanstack/react-start/server";
import darkThemeUrl from "highlight.js/styles/github-dark.css?url";
import lightThemeUrl from "highlight.js/styles/github.css?url";
import { useEffect } from "react";
import { z } from "zod";
import { FunctionOnce } from "./function-once";

const UserThemeSchema = z.enum(["light", "dark", "system"]).catch("system");
const AppThemeSchema = z.enum(["light", "dark"]).catch("light");

export type UserTheme = z.infer<typeof UserThemeSchema>;
export type AppTheme = z.infer<typeof AppThemeSchema>;

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

export const getUpdatedSourceAttributtes = (
  theme: UserTheme,
  media?: string,
  dataTheme?: string | null
) => {
  if (!media) return; // Only handle source tags with media attribute

  if (theme === "system" && !dataTheme) return;
  if (theme === "system") {
    return { media: `(prefers-color-scheme: ${dataTheme})` };
  }

  const isDark = media === "(prefers-color-scheme: dark)" || dataTheme === "dark";
  const sourceTheme = isDark ? "dark" : "light";
  const mediaValue = theme === sourceTheme ? "all" : "not all";
  return { media: mediaValue, dataTheme: sourceTheme };
};

const updatePictureSource = (theme: UserTheme) => {
  const allSourceWithMedia = document.querySelectorAll("source[media]");

  allSourceWithMedia.forEach((source) => {
    const media = source.getAttribute("media");
    const dataTheme = source.getAttribute("data-theme");
    if (!media) return;

    const newAttribs = getUpdatedSourceAttributtes(theme, media, dataTheme);
    if (!newAttribs) return;

    source.setAttribute("media", newAttribs.media);
    if (newAttribs.dataTheme) {
      source.setAttribute("data-theme", newAttribs.dataTheme);
    } else {
      source.removeAttribute("data-theme");
    }
  });
};

// Client

const getSystemTheme = () => {
  const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");
  return mediaQuery.matches ? "dark" : "light";
};

export const getRootTheme = createClientOnlyFn(() => {
  return document.documentElement.classList.contains("dark") ? "dark" : "light";
});

const setRootTheme = (theme: UserTheme) => {
  const root = document.documentElement;
  root.classList.remove("light", "dark");

  const newTheme = theme === "system" ? getSystemTheme() : theme;
  root.classList.add(newTheme);

  highlightTheme.update(newTheme);
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
  updatePictureSource(theme);
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
