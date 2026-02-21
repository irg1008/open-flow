import { v } from "convex/values";
import { github } from "shared/lib/github";
import { api, components, internal } from "../_generated/api";
import { action, internalAction } from "../_generated/server";
import { ActionCache } from "./../../node_modules/@convex-dev/action-cache/src/client/index";
import { repoFullNameValidator, repoFullNameWithEtagValidator } from "./validators";

export const fetchRepos = internalAction({
  args: {
    listName: v.string(),
    pastDays: v.optional(v.number()),
    query: v.optional(v.string()),
    minStars: v.optional(v.number()),
    limit: v.optional(v.number())
  },
  handler: async (ctx, args) => {
    const { repos } = await github.listRepos(args);
    await ctx.runMutation(internal.github.mutations.upsertRepoList, { name: args.listName, repos });
  }
});

export const _fetchRepoDetail = internalAction({
  args: repoFullNameWithEtagValidator,
  handler: async (_ctx, args) => {
    return await github.getRepo({ ...args, token: process.env.GITHUB_PERSONAL_TOKEN });
  }
});

const repoDetailCache = new ActionCache(components.actionCache, {
  action: internal.github.actions._fetchRepoDetail,
  ttl: 5 * 60 * 1000 // Cache for 5 minutes
});

export const fetchRepoDetail = action({
  args: repoFullNameValidator,
  handler: async (ctx, args): Promise<number | null> => {
    var dbRepo = await ctx.runQuery(api.github.queries.getRepoDetail, args);

    var { status, repo } = await repoDetailCache.fetch(ctx, { ...args, etag: dbRepo?.etag });
    if (repo && repo.etag !== dbRepo?.etag) {
      await ctx.runMutation(internal.github.mutations.upsertRepoDetail, repo);
    }

    return status;
  }
});
