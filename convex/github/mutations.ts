import { authMutation } from "#/lib/functions";
import { v } from "convex/values";
import { signJWT } from "shared/lib/jws";
import { internalMutation } from "../_generated/server";
import * as internal from "./shared";
import { githubInstallationValidator, repoValidator } from "./validators";

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
    return `https://github.com/apps/${process.env.GITHUB_APP_ID}/installations/new?state=${state}`;
  }
});

export const linkUserToIntegration = internalMutation({
  args: {
    installationId: v.number(),
    userId: v.string()
  },
  handler: async (ctx, { installationId, userId }) => {
    const userIntegration = await ctx.db
      .query("githubUserIntegration")
      .withIndex("by_installation_user", (q) =>
        q.eq("installationId", installationId).eq("userId", userId)
      )
      .unique();

    if (userIntegration) {
      return null;
    }

    return await ctx.db.insert("githubUserIntegration", { installationId, userId });
  }
});

export const verifyRepos = internalMutation({
  args: {
    installation: githubInstallationValidator,
    repos: v.array(repoValidator)
  },
  handler: async (ctx, { installation, repos }) => {
    const integration = await internal.getIntegrationByInstallationId(
      ctx,
      installation.installationId
    );

    let integrationId = integration?._id;
    if (!integrationId) {
      integrationId = await ctx.db.insert("githubIntegration", installation);
    }

    await ctx.db.patch("githubIntegration", integrationId, installation);

    for (const repo of repos) {
      await internal.upsertRepoDetail(ctx, { ...repo, integrationId });
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
