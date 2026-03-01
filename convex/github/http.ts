import { internal } from "#/_generated/api";
import { DataModel } from "#/_generated/dataModel";
import { httpAction } from "#/_generated/server";
import { GenericActionCtx } from "convex/server";
import {
  getInstallationAdmins,
  githubApp,
  mapGithubInstallation,
  mapRepos
} from "shared/lib/github-app";
import { verifyJWT } from "shared/lib/jws";

const cerateWebhookHandler = (ctx: GenericActionCtx<DataModel>) => {
  const { webhooks } = githubApp();

  // 1. VERIFY OWNERSHIP (App Installed / Repos Added)
  webhooks.on("installation.created", async ({ payload }) => {
    const installation = mapGithubInstallation(payload.installation);
    const admins = await getInstallationAdmins(installation);

    const repos = mapRepos(payload.repositories);
    await ctx.runMutation(internal.github.mutations.verifyRepos, {
      installation,
      repos,
      users: admins
    });
  });

  webhooks.on("installation_repositories.added", async ({ payload }) => {
    const installation = mapGithubInstallation(payload.installation);
    const repos = mapRepos(payload.repositories_added);
    console.log("added", payload);
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
    console.log("removed", payload);
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

    // Refetch admins and update them, as they may have changed during the suspension.
    // We may need to refetch more data like stars, repo names. Edge case for now.
    const admins = await getInstallationAdmins(installation);
    await ctx.runMutation(internal.github.mutations.replaceIntegrationUsers, {
      installationId: installation.installationId,
      externalUserIds: admins.map((admin) => admin.externalUserId)
    });

    installation.suspended = false;
    await ctx.runMutation(internal.github.mutations.changeSuspensionStatus, installation);
  });

  // 4. TRACK STARS COUNT
  webhooks.on("star.created", async ({ payload }) => {
    const externalId = payload.repository.id;
    const stargazersCount = payload.repository.stargazers_count;
    await ctx.runMutation(internal.github.mutations.updateStarCount, {
      externalId,
      stargazersCount
    });
  });

  webhooks.on("star.deleted", async ({ payload }) => {
    const externalId = payload.repository.id;
    const stargazersCount = payload.repository.stargazers_count;
    await ctx.runMutation(internal.github.mutations.updateStarCount, {
      externalId,
      stargazersCount
    });
  });

  // 5. TRACK VISIBILITY CHANGES
  webhooks.on("repository.privatized", async ({ payload }) => {
    const externalId = payload.repository.id;
    await ctx.runMutation(internal.github.mutations.updateVisibility, {
      externalId,
      private: true
    });
  });

  webhooks.on("repository.publicized", async ({ payload }) => {
    const externalId = payload.repository.id;
    await ctx.runMutation(internal.github.mutations.updateVisibility, {
      externalId,
      private: false
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

  webhooks.on("installation_target.renamed", async ({ payload }) => {
    if (!payload.account.login) return;
    await ctx.runMutation(internal.github.mutations.updateIntegrationAccountName, {
      installationId: payload.installation.id,
      accountName: payload.account.login
    });
  });

  // 7. TRACK ORGANIZATION MEMBERS
  webhooks.on("organization.member_added", async ({ payload }) => {
    const externalUserId = payload.membership?.user?.id.toString();
    const installationId = payload.installation?.id;
    if (!externalUserId || !installationId) return;

    await ctx.runMutation(internal.github.mutations.addIntegrationUser, {
      installationId,
      externalUserId
    });
  });

  webhooks.on("organization.member_removed", async ({ payload }) => {
    const externalUserId = payload.membership?.user?.id.toString();
    const installationId = payload.installation?.id;
    if (!externalUserId || !installationId) return;

    await ctx.runMutation(internal.github.mutations.deleteIntegrationUser, {
      installationId,
      externalUserId
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
    if (Error.isError(error)) {
      console.error("Webhook verification/routing failed:", error.message, error.cause);
      return new Response(`Error: ${error.message}`, { status: 401 });
    }

    console.error("Unknown error during webhook processing:", error);
    return new Response("Unknown error", { status: 500 });
  }
});

export const githubInstallAppCallback = httpAction(async (ctx, request) => {
  const url = new URL(request.url);
  const installationId = url.searchParams.get("installation_id");
  const action = url.searchParams.get("setup_action");
  const state = url.searchParams.get("state");

  if (action !== "install") {
    return new Response("Redirect on update", {
      status: 302,
      headers: { location: process.env.SITE_URL }
    });
  }

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

  const redirectURL = new URL(redirectTo, process.env.SITE_URL);
  return new Response("GitHub App installed successfully. You can close this tab.", {
    status: 302,
    headers: { location: redirectURL.toString() }
  });
});
