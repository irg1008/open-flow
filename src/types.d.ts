declare namespace NodeJS {
  interface ProcessEnv {
    SITE_URL: string; // Set both inside and outside convex dashboard
    BASE: string | undefined;

    // Set inside convex dashboard
    GITHUB_CLIENT_ID: string;
    GITHUB_CLIENT_SECRET: string;
    BETTER_AUTH_SECRET: string;

    CONVEX_DEPLOYMENT: string;
    CONVEX_URL: string;
    CONVEX_SITE_URL: string;
  }
}

declare namespace App {
  interface Locals {
    authorized?: boolean;
  }
}
