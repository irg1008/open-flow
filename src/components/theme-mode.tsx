import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger
} from "@/components/ui/dropdown-menu";
import { m } from "@/i18n/_generated/messages";
import darkThemeUrl from "highlight.js/styles/github-dark.css?url";
import lightThemeUrl from "highlight.js/styles/github.css?url";
import { Moon, Sun } from "lucide-react";
import * as React from "react";

const HIGHLIGHT_THEME = {
  dark: darkThemeUrl,
  light: lightThemeUrl
} as const;

export function ThemeMode() {
  const [theme, setThemeState] = React.useState<"light" | "dark" | "system">("light");

  const syncThemeArtifacts = React.useCallback((resolvedTheme: "light" | "dark") => {
    document.documentElement.classList[resolvedTheme === "dark" ? "add" : "remove"]("dark");

    let linkTag = document.getElementById("highlight-theme") as HTMLLinkElement | null;
    if (!linkTag) {
      linkTag = document.createElement("link");
      linkTag.id = "highlight-theme";
      linkTag.rel = "stylesheet";
      document.head.appendChild(linkTag);
    }
    linkTag.href = HIGHLIGHT_THEME[resolvedTheme];
  }, []);

  React.useEffect(() => {
    const savedTheme = localStorage.getItem("theme") as "light" | "dark" | "system" | null;
    const initialTheme =
      savedTheme ?? (document.documentElement.classList.contains("dark") ? "dark" : "light");
    setThemeState(initialTheme);
  }, []);

  React.useEffect(() => {
    const resolvedTheme =
      theme === "system"
        ? window.matchMedia("(prefers-color-scheme: dark)").matches
          ? "dark"
          : "light"
        : theme;

    localStorage.setItem("theme", theme);
    syncThemeArtifacts(resolvedTheme);
  }, [theme, syncThemeArtifacts]);

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size="icon">
          <Sun className="h-[1.2rem] w-[1.2rem] scale-100 rotate-0 transition-all dark:scale-0 dark:-rotate-90" />
          <Moon className="absolute h-[1.2rem] w-[1.2rem] scale-0 rotate-90 transition-all dark:scale-100 dark:rotate-0" />
          <span className="sr-only">{m.theme_toggle()}</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem onClick={() => setThemeState("light")}>
          {m.theme_light()}
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => setThemeState("dark")}>{m.theme_dark()}</DropdownMenuItem>
        <DropdownMenuItem onClick={() => setThemeState("system")}>
          {m.theme_system()}
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
