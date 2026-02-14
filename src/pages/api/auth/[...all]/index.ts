import type { APIRoute } from "astro";
import { CONVEX_SITE_URL } from "astro:env/client";

export const prerender = false;

const handler = ({ request }: { request: Request }) => {
  const requestUrl = new URL(request.url);

  const nextUrl = `${CONVEX_SITE_URL}${requestUrl.pathname}${requestUrl.search}`;
  const forwardRequest = new Request(nextUrl, request);

  forwardRequest.headers.set("accept-encoding", "application/json");
  return fetch(forwardRequest, { method: request.method, redirect: "manual" });
};

export const ALL: APIRoute = async (context) => {
  return handler(context);
};
