import { api } from "#/_generated/api";
import { Avatar, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ButtonGroup } from "@/components/ui/button-group";
import {
  Item,
  ItemActions,
  ItemDescription,
  ItemGroup,
  ItemHeader,
  ItemTitle
} from "@/components/ui/item";
import { Spinner } from "@/components/ui/spinner";
import { m } from "@/i18n/_generated/messages";
import { useMutation, useQuery } from "@/lib/convex";
import { cn } from "@/lib/utils";
import { Link, useLocation, useNavigate } from "@tanstack/react-router";
import { ExternalLinkIcon, StarIcon } from "lucide-react";
import { constants } from "shared/constants";

export const GithubIntegration = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const getGithubInstallUrl = useMutation(api.github.mutations.getInstallAppUrl);
  const startGithubIntegration = async () => {
    const installUrl = await getGithubInstallUrl({ redirectTo: location.href });
    await navigate({ href: installUrl });
  };

  const githubIntegrations = useQuery(api.github.queries.getUserIntegrationsRepos);

  if (!githubIntegrations) {
    return (
      <span className="flex justify-center">
        <Spinner />
      </span>
    );
  }

  return (
    <>
      {githubIntegrations.length === 0 && (
        <div className="text-muted-foreground rounded-md border border-dashed p-4 text-sm">
          {m.settings_integrations_empty()}

          <Button variant="outline" size="sm" className="ms-4" onClick={startGithubIntegration}>
            {m.settings_integrations_connect_first()}
          </Button>
        </div>
      )}

      {githubIntegrations.length > 0 && (
        <>
          <div className="flex flex-col items-start gap-4">
            <ButtonGroup>
              <Button
                variant="outline"
                size="sm"
                className="ms-auto"
                onClick={startGithubIntegration}
              >
                {m.settings_integrations_connect_more()}
              </Button>

              <Button variant="outline" size="sm" asChild>
                <a
                  href={`https://github.com/apps/${constants.githubAppSlug}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-primary text-sm underline"
                >
                  <span className="hidden md:inline">{m.settings_integrations_configure()}</span>

                  <ExternalLinkIcon className="inline-block md:ml-1" size={16} />
                </a>
              </Button>
            </ButtonGroup>
          </div>

          {githubIntegrations.map(
            (integration) =>
              integration && (
                <div key={integration.installationId} className="@container mt-8">
                  <header className="mb-4 flex items-center gap-2">
                    {integration.accountAvatarUrl && (
                      <Avatar>
                        <AvatarImage
                          src={integration.accountAvatarUrl}
                          alt={integration.accountName || undefined}
                        />
                      </Avatar>
                    )}
                    <p className="text-sm font-medium">{integration.accountName ?? "-"}</p>

                    {integration.suspended && (
                      <Badge variant="outline">{m.settings_integrations_suspended()}</Badge>
                    )}
                    {integration.repoSelectionAll && (
                      <Badge variant="secondary">{m.settings_integrations_all_repos()}</Badge>
                    )}
                  </header>

                  {integration.repoSelection.length > 0 && (
                    <ItemGroup
                      className={cn(
                        "mt-2 grid basis-full gap-2 @md:grid-cols-2 @lg:grid-cols-3",
                        integration.suspended && "pointer-events-none opacity-50"
                      )}
                    >
                      {integration.repoSelection.map((repo) => (
                        <Item
                          key={repo._id}
                          variant="outline"
                          size="xs"
                          className={cn(!integration.suspended && repo.private && "opacity-50")}
                          asChild
                        >
                          <Link
                            disabled={repo.private}
                            to="/$owner/$repo"
                            params={{ owner: integration.accountName!, repo: repo.name }}
                          >
                            <ItemHeader>
                              <ItemTitle className="line-clamp-1 break-all">{repo.name}</ItemTitle>
                              {repo.stargazersCount !== undefined && (
                                <ItemActions className="text-sm">
                                  <StarIcon size={14} />
                                  {repo.stargazersCount}
                                </ItemActions>
                              )}
                            </ItemHeader>
                            <ItemDescription className="line-clamp-3 flex flex-col gap-1">
                              {repo.description ?? m.repos_no_description()}
                              {repo.private && <Badge variant="outline">{m.repos_private()}</Badge>}
                            </ItemDescription>
                          </Link>
                        </Item>
                      ))}
                    </ItemGroup>
                  )}
                </div>
              )
          )}
        </>
      )}
    </>
  );
};
