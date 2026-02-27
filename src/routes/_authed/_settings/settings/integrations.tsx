import { IntegrationsSettings } from "@/features/settings/IntegrationsSettings";
import { createFileRoute } from "@tanstack/react-router";
import z from "zod";

export const Route = createFileRoute("/_authed/_settings/settings/integrations")({
  validateSearch: z.object({ tab: z.string().optional() }),
  component: IntegrationsSettings
});
