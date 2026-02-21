import { NotFound } from "@/components/not-found";
import { createFileRoute, Outlet } from "@tanstack/react-router";

export const Route = createFileRoute("/_authed")({
  component: () => {
    const { isAuthenticated } = Route.useRouteContext();
    return isAuthenticated ? <Outlet /> : <NotFound />;
  }
});
