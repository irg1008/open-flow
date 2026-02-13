import { CONVEX_URL } from "astro:env/client";
import { ConvexProvider, ConvexReactClient, useMutation, useQuery } from "convex/react";
import type { JSX, PropsWithChildren } from "react";
import { api } from "../../convex/_generated/api";

const client = new ConvexReactClient(CONVEX_URL);

function ConvexClientProvider(props: PropsWithChildren) {
  return (
    <ConvexProvider client={client}>
      {props.children}
    </ConvexProvider>
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

export { api, useMutation, useQuery, withConvex };

