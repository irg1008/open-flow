import { CONVEX_SITE_URL } from "astro:env/client";
import { defineMiddleware } from "astro:middleware";
import type { Session } from "better-auth";

const protectedRoutes = ["/settings"];

export const onRequest = defineMiddleware(async (context, next) => {
  const isProtectedRoute = protectedRoutes.some((route) => context.url.pathname.startsWith(route));
  if (!isProtectedRoute) return next();

  const sessionResponse = await fetch(`${CONVEX_SITE_URL}/api/auth/get-session`, {
    headers: context.request.headers
  });

  const session: Session | null = await sessionResponse.json();
  context.locals.authorized = !!session;

  return next();
});
