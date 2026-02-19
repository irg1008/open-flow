import { IntegrationsSettings } from "@/cells/settings/IntegrationsSettings";
import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/_authed/_settings/settings/integrations")({
  component: IntegrationsSettings
});
