import { api } from "#/_generated/api";
import { authClient } from "@/lib/auth-client";
import { ConvexBetterAuthProvider } from "@convex-dev/better-auth/react";
import { AnyRoute, useRouteContext } from "@tanstack/react-router";
import { useQuery } from "convex-helpers/react";
import { ConvexHttpClient } from "convex/browser";
import { useAction, useMutation } from "convex/react";
import { PropsWithChildren } from "react";

const convexUrl = import.meta.env.VITE_CONVEX_URL;
const httpClient = new ConvexHttpClient(convexUrl);

export const ConvexProvider = ({
  children,
  from
}: PropsWithChildren & { from: AnyRoute["id"] }) => {
  const context = useRouteContext({ from });

  return (
    <ConvexBetterAuthProvider
      client={context.convexQueryClient.convexClient}
      authClient={authClient}
      initialToken={context.token}
    >
      {children}
    </ConvexBetterAuthProvider>
  );
};

export { api, httpClient, useAction, useMutation, useQuery };
