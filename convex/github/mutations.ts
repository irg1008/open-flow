import { authMutation, internalMutation } from "#/lib/functions";
import { v } from "convex/values";
import { constants } from "shared/constants";
import { signJWT } from "shared/lib/jws";
import * as internal from "./shared";
import { deleteIntegrationUsers, getIntegrationUser } from "./shared";
import {
  githubInstallationValidator,
  githubUserIntegrationValidator,
  repoFullNameValidator,
  repoValidator
} from "./validators";

export const upsertRepoList = internalMutation({
  args: {
    name: v.string(),
    repos: v.array(repoValidator)
  },
  handler: async (ctx, { name, repos }) => {
    const normalizedName = name.trim();
    const data = { name: normalizedName, repos };

    const existingList = await ctx.db
      .query("repoList")
      .withIndex("by_name", (q) => q.eq("name", normalizedName))
      .unique();

    if (!existingList) {
      return await ctx.db.insert("repoList", data);
    }

    return await ctx.db.replace("repoList", existingList._id, data);
  }
});

export const upsertRepoDetail = internalMutation({
  args: repoValidator,
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
  args: {
    installation: githubInstallationValidator,
    repos: v.array(repoValidator),
    users: v.optional(v.array(githubUserIntegrationValidator))
  },
  handler: async (ctx, { installation, repos, users = [] }) => {
    const integration = await internal.getIntegrationByInstallationId(
      ctx,
      installation.installationId
    );

    let integrationId = integration?._id;
    if (integrationId) {
      await ctx.db.patch("githubIntegration", integrationId, installation);
    } else {
      integrationId = await ctx.db.insert("githubIntegration", installation);
    }

    for (const repo of repos) {
      await internal.upsertRepoDetail(ctx, { ...repo, integrationId });
    }

    for (const user of users) {
      await ctx.db.insert("githubUserIntegration", user);
    }
  }
});

export const unverifyRepos = internalMutation({
  args: {
    installation: githubInstallationValidator,
    repos: v.array(repoValidator)
  },
  handler: async (ctx, { installation, repos }) => {
    const { installationId } = installation;
    const integration = await internal.getIntegrationByInstallationId(ctx, installationId);
    if (!integration) return null;

    await ctx.db.patch("githubIntegration", integration._id, { repoSelectionAll: false });

    for (const repo of repos) {
      await internal.updateRepoDetail(ctx, repo.externalId, { integrationId: undefined });
    }
  }
});

export const deleteIntegration = internalMutation({
  args: githubInstallationValidator,
  handler: async (ctx, { installationId }) => {
    const integration = await internal.getIntegrationByInstallationId(ctx, installationId);
    if (!integration) return null;
    await ctx.db.delete("githubIntegration", integration._id);
  }
});

export const changeSuspensionStatus = internalMutation({
  args: githubInstallationValidator,
  handler: async (ctx, installation) => {
    const integration = await internal.getIntegrationByInstallationId(
      ctx,
      installation.installationId
    );
    if (!integration) return null;
    await ctx.db.patch("githubIntegration", integration._id, installation);
  }
});

export const updateStarCount = internalMutation({
  args: {
    externalId: v.number(),
    starCount: v.number()
  },
  handler: async (ctx, { externalId, starCount }) => {
    return await internal.updateRepoDetail(ctx, externalId, { stargazersCount: starCount });
  }
});

export const updateVisibility = internalMutation({
  args: {
    externalId: v.number(),
    isPrivate: v.boolean()
  },
  handler: async (ctx, { externalId, isPrivate }) => {
    return await internal.updateRepoDetail(ctx, externalId, { private: isPrivate });
  }
});

export const updateRepoName = internalMutation({
  args: {
    externalId: v.number(),
    name: v.string(),
    ownerLogin: v.string()
  },
  handler: async (ctx, { externalId, name, ownerLogin }) => {
    return await internal.updateRepoDetail(ctx, externalId, { name, ownerLogin });
  }
});

export const updateIntegrationAccountName = internalMutation({
  args: {
    installationId: v.number(),
    accountName: v.string()
  },
  handler: async (ctx, { installationId, accountName }) => {
    const integration = await internal.getIntegrationByInstallationId(ctx, installationId);
    if (!integration) return null;
    return await ctx.db.patch("githubIntegration", integration._id, { accountName });
  }
});

export const markRepoUnaccessible = internalMutation({
  args: repoFullNameValidator,
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
  args: githubUserIntegrationValidator,
  handler: async (ctx, { installationId, externalUserId }) => {
    const userIntegration = await getIntegrationUser(ctx, installationId, externalUserId);
    if (userIntegration) return null;
    return await ctx.db.insert("githubUserIntegration", { installationId, externalUserId });
  }
});

export const deleteIntegrationUser = internalMutation({
  args: githubUserIntegrationValidator,
  handler: async (ctx, { installationId, externalUserId }) => {
    const userIntegration = await getIntegrationUser(ctx, installationId, externalUserId);
    if (!userIntegration) return null;
    return await ctx.db.delete("githubUserIntegration", userIntegration._id);
  }
});

export const replaceIntegrationUsers = internalMutation({
  args: {
    installationId: v.number(),
    externalUserIds: v.array(v.string())
  },
  handler: async (ctx, { installationId, externalUserIds }) => {
    await deleteIntegrationUsers(ctx, installationId);

    for (const externalUserId of externalUserIds) {
      await ctx.db.insert("githubUserIntegration", { installationId, externalUserId });
    }
  }
});
