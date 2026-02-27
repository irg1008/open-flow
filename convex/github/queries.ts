import { query } from "#/_generated/server";
import { authQuery } from "#/lib/functions";
import { getExternalId, getIntegration, getIntegrationRepos } from "./shared";
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
    const externalId = await getExternalId(ctx);

    const userIntegrations = await ctx.db
      .query("githubUserIntegration")
      .withIndex("by_external_user_id", (q) => q.eq("externalUserId", externalId))
      .collect();

    return await Promise.all(
      userIntegrations.map(async (userIntegration) => {
        const integration = await getIntegration(ctx, userIntegration);
        if (!integration || integration.suspended) return { ...integration, repoSelection: [] };

        const repos = await getIntegrationRepos(ctx, integration._id);
        return {
          ...integration,
          repoSelection: repos.sort((a, b) => Number(a.private) - Number(b.private))
        };
      })
    );
  }
});
