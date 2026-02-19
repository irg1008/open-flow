import { convexBetterAuthReactStart } from "@convex-dev/better-auth/react-start";
import { createServerFn } from "@tanstack/react-start";

export const { handler, getToken, fetchAuthQuery, fetchAuthMutation, fetchAuthAction } =
  convexBetterAuthReactStart({
    convexUrl: import.meta.env.VITE_CONVEX_URL!,
    convexSiteUrl: import.meta.env.VITE_CONVEX_SITE_URL!
  });

export const getAuth = createServerFn({ method: "GET" }).handler(async () => {
  return await getToken();
});
