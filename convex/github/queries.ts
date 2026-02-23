import { query } from "#/_generated/server";
import { authQuery } from "#/lib/functions";
import { getIntegration, getIntegrationRepos } from "./shared";
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

export const getUserIntegrations = authQuery({
  handler: async (ctx) => {
    const userId = ctx.user.subject;

    const userIntegrations = await ctx.db
      .query("githubUserIntegration")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .collect();

    return await Promise.all(
      userIntegrations.map(async (userIntegration) => {
        const integration = await getIntegration(ctx, userIntegration);
        const repos = integration ? await getIntegrationRepos(ctx, integration._id) : [];
        return { ...integration, repoSelection: repos };
      })
    );
  }
});
