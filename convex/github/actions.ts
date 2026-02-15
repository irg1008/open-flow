import { v } from "convex/values";
import { listRepos as listGithubRepos } from "shared/lib/github";
import { internal } from "../_generated/api";
import { internalAction } from "../_generated/server";

export const listRepos = internalAction({
  args: {
    listName: v.string(),
    pastDays: v.optional(v.number()),
    query: v.optional(v.string()),
    minStars: v.optional(v.number()),
    limit: v.optional(v.number())
  },
  handler: async (ctx, args) => {
    const { repos } = await listGithubRepos(args);
    await ctx.runMutation(internal.github.mutations.saveRepoList, { name: args.listName, repos });
  }
});
