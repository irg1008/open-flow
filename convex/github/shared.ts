import { Doc, Id } from "#/_generated/dataModel";
import { MutationCtx, QueryCtx } from "#/_generated/server";
import { Repo } from "./validators";

export const updateRepoDetail = async (
  ctx: MutationCtx,
  externalId: Doc<"repoDetail">["externalId"],
  data: Partial<Repo>
) => {
  const existing = await ctx.db
    .query("repoDetail")
    .withIndex("by_external_id", (q) => q.eq("externalId", externalId))
    .unique();

  if (!existing) return null;

  await ctx.db.patch("repoDetail", existing._id, data);
  return existing._id;
};

export const upsertRepoDetail = async (ctx: MutationCtx, data: Repo) => {
  const repoDetail = await updateRepoDetail(ctx, data.externalId, data);
  if (repoDetail) return repoDetail;
  return await ctx.db.insert("repoDetail", data);
};

export const getIntegrationByInstallationId = async (ctx: QueryCtx, installationId: number) => {
  return await ctx.db
    .query("githubIntegration")
    .withIndex("by_installation_id", (q) => q.eq("installationId", installationId))
    .unique();
};

export const getIntegration = (ctx: QueryCtx, userIntegration: Doc<"githubUserIntegration">) => {
  return ctx.db
    .query("githubIntegration")
    .withIndex("by_installation_id", (q) => q.eq("installationId", userIntegration.installationId))
    .first();
};

export const getIntegrationRepos = async (
  ctx: QueryCtx,
  integrationId: Id<"githubIntegration">
) => {
  return await ctx.db
    .query("repoDetail")
    .withIndex("by_integration_id", (q) => q.eq("integrationId", integrationId))
    .collect();
};
