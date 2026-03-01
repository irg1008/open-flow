import { authMutation, internalMutation } from "#/lib/functions";
import { asyncMap } from "convex-helpers";
import { v } from "convex/values";
import { constants } from "shared/constants";
import { signJWT } from "shared/lib/jws";
import * as internal from "./shared";
import { deleteIntegrationUsers, getUserIntegration, unlinkIntegrationRepos } from "./shared";
import {
  RepoList,
  vGithubIntegration,
  vGithubUserIntegrationArgs,
  vRepoDetail,
  vRepoFullName
} from "./validators";

const vVerifyReposArgs = v.object({
  installation: vGithubIntegration,
  repos: v.array(vRepoDetail),
  users: v.optional(v.array(vGithubUserIntegrationArgs))
});

export const upsertRepoList = internalMutation({
  args: {
    name: v.string(),
    repos: v.array(vRepoDetail)
  },
  handler: async (ctx, { name, repos }) => {
    const repoDetailIds = await asyncMap(repos, (repo) => internal.upsertRepoDetail(ctx, repo));

    const data: RepoList = { name, repoDetailIds };
    const existingList = await ctx.db
      .query("repoList")
      .withIndex("by_name", (q) => q.eq("name", name))
      .unique();

    if (!existingList) {
      return await ctx.db.insert("repoList", data);
    }

    return await ctx.db.replace("repoList", existingList._id, data);
  }
});

export const upsertRepoDetail = internalMutation({
  args: vRepoDetail,
  handler: internal.upsertRepoDetail
});

export const getInstallAppUrl = authMutation({
  args: {
    redirectTo: v.string()
  },
  handler: async (ctx, { redirectTo }) => {
    const isRelativeUrl = redirectTo.startsWith("/");
    if (!isRelativeUrl) {
      throw new Error("Invalid redirect URL");
    }

    const userId = ctx.user.subject;
    const state = await signJWT({ userId, redirectTo });
    return `https://github.com/apps/${constants.githubAppSlug}/installations/new?state=${state}`;
  }
});

export const verifyRepos = internalMutation({
  args: vVerifyReposArgs,
  handler: async (ctx, { installation, repos, users = [] }) => {
    const integration = await internal.getIntegration(ctx, installation.installationId);

    let integrationId = integration?._id;
    if (integrationId) {
      await ctx.db.patch("githubIntegration", integrationId, installation);
    } else {
      integrationId = await ctx.db.insert("githubIntegration", installation);
    }

    // Unlink if change from all to selected, then link selected
    if (integration?.repoSelectionAll && !installation.repoSelectionAll) {
      await unlinkIntegrationRepos(ctx, integration._id);
    }
    for (const repo of repos) {
      await internal.upsertRepoDetail(ctx, { ...repo, integrationId });
    }

    for (const user of users) {
      await ctx.db.insert("githubUserIntegration", { ...user, integrationId });
    }
  }
});

export const unverifyRepos = internalMutation({
  args: vVerifyReposArgs,
  handler: async (ctx, { installation, repos }) => {
    const { installationId } = installation;
    const integration = await internal.getIntegration(ctx, installationId);
    if (!integration) return null;

    await ctx.db.patch("githubIntegration", integration._id, { repoSelectionAll: false });

    for (const repo of repos) {
      await internal.updateRepoDetail(ctx, repo.externalId, { integrationId: undefined });
    }
  }
});

export const deleteIntegration = internalMutation({
  args: vGithubIntegration,
  handler: async (ctx, { installationId }) => {
    const integration = await internal.getIntegration(ctx, installationId);
    if (!integration) return null;
    await ctx.db.delete("githubIntegration", integration._id);
  }
});

export const changeSuspensionStatus = internalMutation({
  args: vGithubIntegration,
  handler: async (ctx, installation) => {
    const integration = await internal.getIntegration(ctx, installation.installationId);
    if (!integration) return null;
    await ctx.db.patch("githubIntegration", integration._id, installation);
  }
});

export const updateStarCount = internalMutation({
  args: vRepoDetail.pick("externalId", "stargazersCount"),
  handler: async (ctx, { externalId, stargazersCount }) => {
    return await internal.updateRepoDetail(ctx, externalId, { stargazersCount });
  }
});

export const updateVisibility = internalMutation({
  args: vRepoDetail.pick("externalId", "private"),
  handler: async (ctx, { externalId, private: isPrivate }) => {
    return await internal.updateRepoDetail(ctx, externalId, { private: isPrivate });
  }
});

export const updateRepoName = internalMutation({
  args: vRepoDetail.pick("externalId", "name", "ownerLogin"),
  handler: async (ctx, { externalId, name, ownerLogin }) => {
    return await internal.updateRepoDetail(ctx, externalId, { name, ownerLogin });
  }
});

export const updateIntegrationAccountName = internalMutation({
  args: vGithubIntegration.pick("installationId", "accountName"),
  handler: async (ctx, { installationId, accountName }) => {
    const integration = await internal.getIntegration(ctx, installationId);
    if (!integration) return null;
    return await ctx.db.patch("githubIntegration", integration._id, { accountName });
  }
});

export const markRepoUnaccessible = internalMutation({
  args: vRepoFullName,
  handler: async (ctx, args) => {
    const { owner, name } = args;
    const dbRepo = await ctx.db
      .query("repoDetail")
      .withIndex("by_full_name", (q) => q.eq("ownerLogin", owner).eq("name", name))
      .unique();
    if (!dbRepo) return null;
    return await internal.updateRepoDetail(ctx, dbRepo.externalId, { unaccessible: true });
  }
});

export const addIntegrationUser = internalMutation({
  args: vGithubUserIntegrationArgs,
  handler: async (ctx, { installationId, externalUserId }) => {
    const userIntegration = await getUserIntegration(ctx, installationId, externalUserId);
    if (userIntegration) return null;

    const integration = await internal.getIntegration(ctx, installationId);
    if (!integration) return null;

    return await ctx.db.insert("githubUserIntegration", {
      integrationId: integration._id,
      installationId,
      externalUserId
    });
  }
});

export const deleteIntegrationUser = internalMutation({
  args: vGithubUserIntegrationArgs,
  handler: async (ctx, { installationId, externalUserId }) => {
    const userIntegration = await getUserIntegration(ctx, installationId, externalUserId);
    if (!userIntegration) return null;
    return await ctx.db.delete("githubUserIntegration", userIntegration._id);
  }
});

export const replaceIntegrationUsers = internalMutation({
  args: vGithubIntegration.pick("installationId").extend({
    externalUserIds: v.array(v.string())
  }),
  handler: async (ctx, { installationId, externalUserIds }) => {
    const integration = await internal.getIntegration(ctx, installationId);
    if (!integration) return null;

    await deleteIntegrationUsers(ctx, integration._id);

    for (const externalUserId of externalUserIds) {
      await ctx.db.insert("githubUserIntegration", {
        integrationId: integration._id,
        installationId,
        externalUserId
      });
    }
  }
});
