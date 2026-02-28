import { action, internalAction } from "#/lib/functions";
import { ObjectType, v } from "convex/values";
import { github } from "shared/lib/github";
import { api, components, internal } from "../_generated/api";
import { ActionCache } from "./../../node_modules/@convex-dev/action-cache/src/client/index";
import { vRepoDetail, vRepoFullName } from "./validators";

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
  args: vRepoFullName.extend({
    etag: v.optional(v.string())
  }),
  handler: async (_ctx, args) => {
    return await github.getRepo({ ...args, token: process.env.GITHUB_PERSONAL_TOKEN });
  }
});

const repoDetailCache = new ActionCache(components.actionCache, {
  action: internal.github.actions._fetchRepoDetail,
  ttl: 5 * 60 * 1000 // Cache for 5 minutes
});

const fetchRepoReturnFields = {
  status: v.number(),
  repo: v.optional(v.nullable(vRepoDetail))
};

export const fetchRepoDetail = action({
  args: vRepoFullName,
  returns: fetchRepoReturnFields,
  handler: async (ctx, args): Promise<ObjectType<typeof fetchRepoReturnFields>> => {
    var dbRepo = await ctx.runQuery(api.github.queries.getRepoDetail, args);

    var { status, repo } = await repoDetailCache.fetch(ctx, { ...args, etag: dbRepo?.etag });
    if (repo && repo.etag !== dbRepo?.etag) {
      repo.unaccessible = false;
      await ctx.runMutation(internal.github.mutations.upsertRepoDetail, repo);
    }

    if (status === 404) {
      await ctx.runMutation(internal.github.mutations.markRepoUnaccessible, args);
    }

    return { status, repo };
  }
});
