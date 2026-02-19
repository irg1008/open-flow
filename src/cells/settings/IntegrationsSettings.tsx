import { Card, CardContent } from "@/components/ui/card";
import { m } from "@/i18n/_generated/messages";

export function IntegrationsSettings() {
  return (
    <Card>
      <CardContent>
        <h2 className="font-medium">{m.settings_integrations_list_title()}</h2>
        <p className="text-muted-foreground mt-2 text-sm">{m.settings_integrations_empty()}</p>
      </CardContent>
    </Card>
  );
}
