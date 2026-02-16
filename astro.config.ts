// @ts-check
import node from "@astrojs/node";
import partytown from "@astrojs/partytown";
import react from "@astrojs/react";
import sitemap from "@astrojs/sitemap";
import tailwindcss from "@tailwindcss/vite";
import ezI18n from "@zachhandley/ez-i18n";
import { defineConfig, envField } from "astro/config";

// https://astro.build/config
export default defineConfig({
  site: process.env.SITE_URL || "http://localhost:4322",
  base: process.env.BASE || "/",
  integrations: [
    react(),
    ezI18n({
      defaultLocale: "en",
      translations: {
        en: "./src/i18n/en.json",
        es: "./src/i18n/es.json"
      }
    }),
    sitemap(),
    partytown({
      config: { forward: ["dataLayer.push"] }
    })
  ],

  vite: {
    plugins: [tailwindcss()]
  },

  server: {
    allowedHosts: ["rincondelasella.com"]
  },

  output: "server",
  adapter: node({
    mode: "standalone"
  }),

  env: {
    schema: {
      CONVEX_URL: envField.string({
        access: "public",
        context: "client"
      }),
      CONVEX_SITE_URL: envField.string({
        access: "public",
        context: "client"
      })
    }
  }
});
