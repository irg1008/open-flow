import { query } from "#/_generated/server";
import { repoFullNameValidator } from "./validators";

export const getRepoDetail = query({
  args: repoFullNameValidator,
  handler: async (ctx, args) => {
    const repoDetail = await ctx.db
      .query("repoDetail")
      .withIndex("by_full_name", (q) => q.eq("ownerLogin", args.owner).eq("name", args.name))
      .first();

    return repoDetail;
  }
});
