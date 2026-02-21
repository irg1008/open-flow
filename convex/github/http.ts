import { internal } from "#/_generated/api";
import { DataModel } from "#/_generated/dataModel";
import { httpAction } from "#/_generated/server";
import { Webhooks } from "@octokit/webhooks";
import { HandlerFunction } from "@octokit/webhooks/types";
import { validate } from "convex-helpers/validators";
import { GenericActionCtx } from "convex/server";
import { verifyJWT } from "shared/lib/jws";
import { accountTypeValidator, GithubInstallation, Repo } from "./validators";

const secret = process.env.GITHUB_WEBHOOK_SECRET;

type EventParameters = Parameters<HandlerFunction<"installation">>[0]["payload"];
type EventInstallation = EventParameters["installation"];
type EventRepository = NonNullable<EventParameters["repositories"]>[number];

const mapGithubInstallation = (installation: EventInstallation): GithubInstallation => {
  const { account } = installation;

  let accountType;
  if (account && "type" in account && validate(accountTypeValidator, account.type)) {
    accountType = account.type;
  }

  let accountName;
  if (account && "login" in account) {
    accountName = account.login;
  }

  return {
    accountName,
    accountType,
    suspendedAt: installation.suspended_at,
    suspendedByName: installation.suspended_by?.login,
    installationId: installation.id,
    installationClientId: installation.client_id,
    repoSelectionAll: installation.repository_selection === "all"
  };
};

const mapRepos = (repositories?: EventRepository[]): Repo[] => {
  if (!repositories) return [];
  return repositories.map((repo) => ({
    externalId: repo.id,
    name: repo.name
  }));
};

const cerateWebhookHandler = (ctx: GenericActionCtx<DataModel>) => {
  const webhooks = new Webhooks({ secret });

  // 1. VERIFY OWNERSHIP (App Installed / Repos Added)
  webhooks.on("installation.created", async ({ payload }) => {
    const installation = mapGithubInstallation(payload.installation);
    const repos = mapRepos(payload.repositories);
    await ctx.runMutation(internal.github.mutations.verifyRepos, { installation, repos });
  });

  webhooks.on("installation_repositories.added", async ({ payload }) => {
    const installation = mapGithubInstallation(payload.installation);
    const repos = mapRepos(payload.repositories_added);
    await ctx.runMutation(internal.github.mutations.verifyRepos, { installation, repos });
  });

  // 2. UNVERIFY OWNERSHIP (App Deleted / Repos Removed)
  webhooks.on("installation.deleted", async ({ payload }) => {
    const installation = mapGithubInstallation(payload.installation);
    await ctx.runMutation(internal.github.mutations.deleteIntegration, installation);
  });

  webhooks.on("installation_repositories.removed", async ({ payload }) => {
    const installation = mapGithubInstallation(payload.installation);
    const repos = mapRepos(payload.repositories_removed);
    await ctx.runMutation(internal.github.mutations.unverifyRepos, { installation, repos });
  });

  // 3. TRACK SUSPENSIONS
  webhooks.on("installation.suspend", async ({ payload }) => {
    const installation = mapGithubInstallation(payload.installation);
    installation.suspended = true;
    await ctx.runMutation(internal.github.mutations.changeSuspensionStatus, installation);
  });

  webhooks.on("installation.unsuspend", async ({ payload }) => {
    const installation = mapGithubInstallation(payload.installation);
    installation.suspended = false;
    await ctx.runMutation(internal.github.mutations.changeSuspensionStatus, installation);
  });

  // 4. TRACK STARS COUNT
  webhooks.on("star.created", async ({ payload }) => {
    const externalId = payload.repository.id;
    const starCount = payload.repository.stargazers_count;
    await ctx.runMutation(internal.github.mutations.updateStarCount, { externalId, starCount });
  });

  webhooks.on("star.deleted", async ({ payload }) => {
    const externalId = payload.repository.id;
    const starCount = payload.repository.stargazers_count;
    await ctx.runMutation(internal.github.mutations.updateStarCount, { externalId, starCount });
  });

  // 5. TRACK VISIBILITY CHANGES
  webhooks.on("repository.privatized", async ({ payload }) => {
    const externalId = payload.repository.id;
    await ctx.runMutation(internal.github.mutations.updateVisibility, {
      externalId,
      isPrivate: true
    });
  });

  webhooks.on("repository.publicized", async ({ payload }) => {
    const externalId = payload.repository.id;
    await ctx.runMutation(internal.github.mutations.updateVisibility, {
      externalId,
      isPrivate: false
    });
  });

  // 6. TRACK RENAMES
  webhooks.on("repository.renamed", async ({ payload }) => {
    const externalId = payload.repository.id;
    const name = payload.repository.name;
    const ownerLogin = payload.repository.owner.login;
    await ctx.runMutation(internal.github.mutations.updateRepoName, {
      externalId,
      name,
      ownerLogin
    });
  });

  return webhooks;
};

export const githubWebhook = httpAction(async (ctx, request) => {
  const signature = request.headers.get("x-hub-signature-256");
  const eventName = request.headers.get("x-github-event");
  const deliveryId = request.headers.get("x-github-delivery");
  const payload = await request.text();

  if (!signature || !eventName || !deliveryId) {
    return new Response("Missing GitHub headers", { status: 400 });
  }

  const webhooks = cerateWebhookHandler(ctx);

  try {
    await webhooks.verifyAndReceive({ id: deliveryId, name: eventName, payload, signature });
    return new Response("Webhook processed successfully", { status: 200 });
  } catch (error) {
    if (error instanceof Error) {
      console.error("Webhook verification/routing failed:", error.message);
      return new Response(`Error: ${error.message}`, { status: 401 });
    }

    console.error("Unknown error during webhook processing:", error);
    return new Response("Unknown error", { status: 500 });
  }
});

export const githubInstallAppCallback = httpAction(async (ctx, request) => {
  const url = new URL(request.url);
  const installationId = url.searchParams.get("installation_id");
  const state = url.searchParams.get("state");

  if (!installationId || !state) {
    return new Response("Missing parameters", { status: 400 });
  }

  const payload = await verifyJWT<{ userId: string; redirectTo: string }>(state);
  if (!payload) {
    return new Response("Invalid or expired state", { status: 401 });
  }

  const { userId, redirectTo } = payload;
  if (!userId || !redirectTo) {
    return new Response("Invalid state payload", { status: 401 });
  }

  // We link the user since installation creation is handled via webhook.
  // We may need to refactor if somehow calback starts being called before webhook does.
  await ctx.runMutation(internal.github.mutations.linkUserToIntegration, {
    userId,
    installationId: parseInt(installationId, 10)
  });

  const redirectURL = new URL(redirectTo, process.env.SITE_URL);
  return new Response("GitHub App installed successfully. You can close this tab.", {
    status: 302,
    headers: { location: redirectURL.toString() }
  });
});
