import { v } from "convex/values";
import { internalMutation } from "../_generated/server";
import { repoValidator } from "./validators";

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

    return await ctx.db.patch(existingList._id, data);
  }
});

export const upsertRepoDetail = internalMutation({
  args: repoValidator,
  handler: async (ctx, repo) => {
    const existing = await ctx.db
      .query("repoDetail")
      .withIndex("by_full_name", (q) => q.eq("ownerLogin", repo.ownerLogin).eq("name", repo.name))
      .unique();

    if (!existing) {
      return await ctx.db.insert("repoDetail", repo);
    }

    return await ctx.db.patch(existing._id, repo);
  }
});
