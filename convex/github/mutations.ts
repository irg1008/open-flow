import { v } from "convex/values";
import { internalMutation } from "../_generated/server";
import { repoValidator } from "./validators";

export const saveRepoList = internalMutation({
  args: {
    name: v.string(),
    repos: v.array(repoValidator)
  },
  handler: async (ctx, { name, repos }) => {
    const normalizedName = name.trim();
    const data = { name: normalizedName, repos };

    const existingList = await ctx.db
      .query("repoLists")
      .withIndex("by_name", (q) => q.eq("name", normalizedName))
      .unique();

    if (!existingList) {
      return await ctx.db.insert("repoLists", data);
    }

    return await ctx.db.patch(existingList._id, data);
  }
});
