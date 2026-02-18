import { ConvexBetterAuthProvider } from "@convex-dev/better-auth/react";
import { CONVEX_URL } from "astro:env/client";
import { ConvexHttpClient } from "convex/browser";
import { ConvexProvider, ConvexReactClient, useAction, useMutation, useQuery } from "convex/react";
import { api } from "../../convex/_generated/api";
import { authClient } from "./auth";

const client = new ConvexReactClient(CONVEX_URL);
const httpClient = new ConvexHttpClient(CONVEX_URL);

function withConvex<T extends object>(Component: React.ComponentType<T>) {
  return function WrappedComponent(props: T) {
    return (
      <ConvexProvider client={client}>
        <Component {...props} />
      </ConvexProvider>
    );
  };
}

export function withAuthConvex<T extends object>(Component: React.ComponentType<T>) {
  return function WrappedComponent(props: T) {
    return (
      <ConvexBetterAuthProvider client={client} authClient={authClient}>
        <Component {...props} />
      </ConvexBetterAuthProvider>
    );
  };
}

export { api, httpClient, useAction, useMutation, useQuery, withConvex };
