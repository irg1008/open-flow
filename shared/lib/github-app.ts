import {
  AccountType,
  GithubIntegration,
  GithubUserIntegrationArgs,
  RepoDetail,
  vAccountType
} from "#/github/validators";
import { HandlerFunction } from "@octokit/webhooks/types";
import { validate } from "convex-helpers/validators";
import { App } from "octokit";

export const githubApp = () =>
  new App({
    appId: process.env.GITHUB_APP_ID,
    privateKey: process.env.GITHUB_APP_PRIVATE_KEY,
    oauth: {
      clientId: process.env.GITHUB_CLIENT_ID,
      clientSecret: process.env.GITHUB_CLIENT_SECRET
    },
    webhooks: {
      secret: process.env.GITHUB_WEBHOOK_SECRET
    }
  });

type EventParameters = Parameters<HandlerFunction<"installation">>[0]["payload"];
type EventInstallation = EventParameters["installation"];
type EventRepository = NonNullable<EventParameters["repositories"]>[number];

export const mapGithubInstallation = (installation: EventInstallation): GithubIntegration => {
  const { account } = installation;

  let accountType: AccountType | undefined;
  if (account && "type" in account && validate(vAccountType, account.type)) {
    accountType = account.type;
  }

  let accountName: string | undefined;
  if (account && "login" in account) {
    accountName = account.login;
  }

  return {
    accountId: account?.id,
    accountAvatarUrl: account?.avatar_url,
    accountName,
    accountType,
    suspendedAt: installation.suspended_at,
    suspendedByName: installation.suspended_by?.login,
    installationId: installation.id,
    installationClientId: installation.client_id,
    repoSelectionAll: installation.repository_selection === "all"
  };
};

export const mapRepos = (repositories?: EventRepository[]): RepoDetail[] => {
  if (!repositories) return [];
  return repositories.map((repo) => ({
    externalId: repo.id,
    name: repo.name,
    private: repo.private
  }));
};

export const getInstallationAdmins = async (
  installation: GithubIntegration
): Promise<GithubUserIntegrationArgs[]> => {
  const { installationId, accountId, accountName, accountType } = installation;

  if (!accountId || !accountName) {
    throw new Error("Installation account name is required to fetch members");
  }

  if (accountType !== "Organization") {
    return [{ externalUserId: accountId.toString(), installationId }];
  }

  const allAdmins = getAllInstallationAdmins(installationId, accountName);
  return Array.fromAsync(allAdmins).then((admins) => admins.flat());
};

export async function* getAllInstallationAdmins(installationId: number, accountName: string) {
  const { getInstallationOctokit } = githubApp();
  const installationOctokit = await getInstallationOctokit(installationId);

  let page = 1;
  let fetchMore = true;

  const perPage = 100;
  const maxPage = 5; // Safety limit. Assuming no org has more than 500 admins.

  while (fetchMore && page <= maxPage) {
    const { data: members } = await installationOctokit.rest.orgs.listMembers({
      org: accountName,
      role: "admin",
      per_page: perPage,
      page
    });

    page++;
    fetchMore = members.length === perPage;

    yield members.map((member) => ({
      externalUserId: member.id.toString(),
      installationId
    }));
  }
}
