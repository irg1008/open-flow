// @ts-check
import node from "@astrojs/node";
import partytown from "@astrojs/partytown";
import react from "@astrojs/react";
import sitemap from "@astrojs/sitemap";
import tailwindcss from "@tailwindcss/vite";
import { defineConfig, envField } from "astro/config";

// https://astro.build/config
export default defineConfig({
  site: process.env.SITE || "http://localhost:4321",
  base: process.env.BASE || "/",
  integrations: [
    react(),
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

  adapter: node({
    mode: "standalone"
  }),

  env: {
    schema: {
      DATABASE_URL: envField.string({ context: "server", access: "secret" })
    }
  }
});
