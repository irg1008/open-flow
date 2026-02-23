import { NotFound } from "@/components/not-found";
import { createFileRoute, Outlet } from "@tanstack/react-router";
import { Authenticated } from "convex/react";

export const Route = createFileRoute("/_authed")({
  component: () => {
    const { isAuthenticated } = Route.useRouteContext();
    if (!isAuthenticated) return <NotFound />;

    return (
      <Authenticated>
        <Outlet />
      </Authenticated>
    );
  }
});
