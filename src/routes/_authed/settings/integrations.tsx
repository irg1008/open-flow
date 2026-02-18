import { IntegrationsSettings } from "@/cells/settings/IntegrationsSettings";
import { SettingsSidebar } from "@/components/settings-sidebar";
import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/_authed/settings/integrations")({
  component: IntegrationsPage
});

function IntegrationsPage() {
  return (
    <SettingsSidebar currentPath="/settings/integrations">
      <IntegrationsSettings />
    </SettingsSidebar>
  );
}
