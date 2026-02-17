import { ConvexBetterAuthProvider } from "@convex-dev/better-auth/react";
import { CONVEX_URL } from "astro:env/client";
import { ConvexHttpClient } from "convex/browser";
import { ConvexReactClient, useAction, useMutation, useQuery } from "convex/react";
import type { PropsWithChildren } from "react";
import { api } from "../../convex/_generated/api";
import { authClient } from "./auth";

const client = new ConvexReactClient(CONVEX_URL);
const httpClient = new ConvexHttpClient(CONVEX_URL);

function ConvexClientProvider(props: PropsWithChildren) {
  return (
    <ConvexBetterAuthProvider client={client} authClient={authClient}>
      {props.children}
    </ConvexBetterAuthProvider>
  );
}

function withConvex<T extends object>(Component: React.ComponentType<T>) {
  return function WrappedComponent(props: T) {
    return (
      <ConvexClientProvider>
        <Component {...props} />
      </ConvexClientProvider>
    );
  };
}

export { api, httpClient, useAction, useMutation, useQuery, withConvex };
