import { convexClient, crossDomainClient } from "@convex-dev/better-auth/client/plugins";
import { CONVEX_URL } from "astro:env/client";
import { createAuthClient } from "better-auth/react";

console.log(CONVEX_URL);

export const authClient = createAuthClient({
  baseURL: CONVEX_URL,
  plugins: [convexClient(), crossDomainClient()]
});
