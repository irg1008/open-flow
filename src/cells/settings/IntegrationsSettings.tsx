import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { m } from "@/i18n/_generated/messages";
import { api, useMutation } from "@/lib/convex";
import { useLocation, useNavigate } from "@tanstack/react-router";

export function IntegrationsSettings() {
  const navigate = useNavigate();
  const location = useLocation();

  const getGithubInstallUrl = useMutation(api.github.mutations.getInstallAppUrl);

  const startGithubIntegration = async () => {
    const installUrl = await getGithubInstallUrl({ redirectTo: location.href });
    await navigate({ href: installUrl });
  };

  return (
    <Card>
      <CardContent>
        <h2 className="font-medium">{m.settings_integrations_list_title()}</h2>
        <p className="text-muted-foreground mt-2 text-sm">{m.settings_integrations_empty()}</p>
        Github
        <Button className="mt-4" variant="outline" size="sm" onClick={startGithubIntegration}>
          Connect to github
        </Button>
      </CardContent>
    </Card>
  );
}
