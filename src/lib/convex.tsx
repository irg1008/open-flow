import { ConvexBetterAuthProvider } from "@convex-dev/better-auth/react";
import { CONVEX_URL } from "astro:env/client";
import { ConvexReactClient, useMutation, useQuery } from "convex/react";
import type { JSX, PropsWithChildren } from "react";
import { api } from "../../convex/_generated/api";
import { authClient } from "./auth";

const functions = api.functions;

const client = new ConvexReactClient(CONVEX_URL);

function ConvexClientProvider(props: PropsWithChildren) {
  return (
    <ConvexBetterAuthProvider client={client} authClient={authClient}>
      {props.children}
    </ConvexBetterAuthProvider>
  );
}

function withConvex<T extends JSX.IntrinsicAttributes>(Component: React.ComponentType<T>) {
  return function WrappedComponent(props: T) {
    return (
      <ConvexClientProvider>
        <Component {...props} />
      </ConvexClientProvider>
    );
  };
}

export { functions as api, useMutation, useQuery, withConvex };
