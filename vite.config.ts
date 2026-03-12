import { paraglideVitePlugin } from "@inlang/paraglide-js";
import tailwindcss from "@tailwindcss/vite";
import { tanstackStart } from "@tanstack/react-start/plugin/vite";
import viteReact from "@vitejs/plugin-react";
import { defineConfig } from "vite";
import checker from "vite-plugin-checker";
import tsconfigPaths from "vite-tsconfig-paths";

const isDev = process.env.NODE_ENV === "development";

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
    tsconfigPaths(),
    tanstackStart(),
    viteReact(),
    tailwindcss(),
    i18n(),
    checker({
      enableBuild: false,
      typescript: isDev,
      overlay: false
    })
  ],
  ssr: {
    noExternal: ["@convex-dev/better-auth"]
  },
  server: {
    allowedHosts: process.env.NODE_ENV === "development" ? [".trycloudflare.com"] : undefined
  }
});
