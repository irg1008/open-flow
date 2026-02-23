import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Spinner } from "@/components/ui/spinner";
import { GithubIcon } from "@/components/ui/svgs/github";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { m } from "@/i18n/_generated/messages";
import { api, useMutation, useQuery } from "@/lib/convex";
import { useLocation, useNavigate } from "@tanstack/react-router";
import { ExternalLinkIcon } from "lucide-react";

export function IntegrationsSettings() {
  const navigate = useNavigate();
  const location = useLocation();

  const getGithubInstallUrl = useMutation(api.github.mutations.getInstallAppUrl);
  const startGithubIntegration = async () => {
    const installUrl = await getGithubInstallUrl({ redirectTo: location.href });
    await navigate({ href: installUrl });
  };

  const githubIntegrations = useQuery(api.github.queries.getUserIntegrations);
  if (!githubIntegrations) {
    return <Spinner />;
  }

  console.log(githubIntegrations);

  return (
    <Card>
      <CardContent className="space-y-4">
        <h2 className="font-medium">{m.settings_integrations_list_title()}</h2>
        <Tabs className="mt-4" defaultValue="github">
          <TabsList>
            <TabsTrigger value="github" className="gap-2">
              <GithubIcon />
              {m.settings_integrations_github_tab()}
            </TabsTrigger>
          </TabsList>

          <TabsContent value="github" className="mt-4 space-y-4">
            {githubIntegrations.length === 0 && (
              <div className="text-muted-foreground rounded-md border border-dashed p-4 text-sm">
                {m.settings_integrations_empty()}
              </div>
            )}

            {githubIntegrations.length > 0 && (
              <>
                <div className="flex items-center justify-between">
                  <p className="text-muted-foreground text-sm">
                    {m.settings_integrations_list_title()}
                  </p>

                  <a
                    href="https://github.com/apps/open-source-flow"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-primary text-sm underline"
                  >
                    {m.settings_integrations_configure()}

                    <ExternalLinkIcon className="ml-1 inline-block" size={16} />
                  </a>
                </div>

                {githubIntegrations.map(
                  (integration) =>
                    integration && (
                      <div
                        key={integration.installationId}
                        className="space-y-2 rounded-md border p-3"
                      >
                        <p className="text-sm font-medium">{integration.accountName ?? "-"}</p>

                        {integration.repoSelection.length > 0 && (
                          <ul className="mt-2 space-y-1">
                            {integration.repoSelection.map((repo) => (
                              <li
                                key={repo._id}
                                className="text-muted-foreground flex items-center gap-2 text-sm"
                              >
                                <span>{repo.name}</span>
                              </li>
                            ))}
                          </ul>
                        )}
                      </div>
                    )
                )}
              </>
            )}

            <Button variant="outline" size="sm" className="w-fit" onClick={startGithubIntegration}>
              {m.settings_integrations_connect_more()}
            </Button>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}
