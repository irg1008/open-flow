import { paraglideVitePlugin } from "@inlang/paraglide-js";
import tailwindcss from "@tailwindcss/vite";
import { tanstackStart } from "@tanstack/react-start/plugin/vite";
import viteReact from "@vitejs/plugin-react";
import { defineConfig } from "vite";
import checker from "vite-plugin-checker";
import tsconfigPaths from "vite-tsconfig-paths";

const i18n = () =>
  paraglideVitePlugin({
    project: "./src/i18n/project.inlang",
    outdir: "./src/i18n/_generated",
    outputStructure: "message-modules",
    cookieName: "locale",
    strategy: ["url", "cookie", "preferredLanguage", "baseLocale"]
  });

export default defineConfig({
  plugins: [
    tsconfigPaths({ projects: ["./tsconfig.json"] }),
    tanstackStart(),
    viteReact(),
    tailwindcss(),
    i18n(),
    checker({ typescript: true })
  ],
  ssr: {
    noExternal: ["@convex-dev/better-auth"]
  }
});
