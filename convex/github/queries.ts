import { authQuery, query } from "#/lib/functions";
import schema from "#/schema";
import { stream } from "convex-helpers/server/stream";
import { getExternalUserId } from "./shared";
import { vRepoFullName } from "./validators";

export const getRepoDetail = query({
  args: vRepoFullName,
  handler: async (ctx, args) => {
    const repoDetail = await ctx.db
      .query("repoDetail")
      .withIndex("by_full_name", (q) => q.eq("ownerLogin", args.owner).eq("name", args.name))
      .first();

    return repoDetail;
  }
});

export const getUserIntegrationsRepos = authQuery({
  handler: async (ctx) => {
    const externalUserId = await getExternalUserId(ctx);

    const userIntegrations = stream(ctx.db, schema)
      .query("githubUserIntegration")
      .withIndex("by_external_user_id", (q) => q.eq("externalUserId", externalUserId));

    return userIntegrations
      .map(async (userIntegration) => {
        const integration = await ctx.db.get("githubIntegration", userIntegration.integrationId);

        if (!integration) return null;
        if (integration.suspended) return { ...integration, repoSelection: [] };

        const repoSelection = await ctx.db
          .query("repoDetail")
          .withIndex("by_integration_id", (q) => q.eq("integrationId", integration._id))
          .collect();

        return { ...integration, repoSelection };
      })
      .collect();
  }
});
