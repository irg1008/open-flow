/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_CONVEX_URL: string;
  readonly VITE_CONVEX_SITE_URL: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}

declare namespace NodeJS {
  interface ProcessEnv {
    SITE_URL: string; // Set both inside and outside convex dashboard
    BASE?: string;

    // Set inside convex dashboard
    GITHUB_CLIENT_ID: string;
    GITHUB_CLIENT_SECRET: string;
    GITHUB_PERSONAL_TOKEN: string;
    BETTER_AUTH_SECRET: string;

    CONVEX_DEPLOYMENT: string;
    VITE_CONVEX_URL: string;
    VITE_CONVEX_SITE_URL: string;
  }
}
