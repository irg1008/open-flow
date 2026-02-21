import { Doc } from "#/_generated/dataModel";
import { MutationCtx } from "#/_generated/server";
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

export const getIntegrationByInstallationId = async (ctx: MutationCtx, installationId: number) => {
  return await ctx.db
    .query("githubIntegration")
    .withIndex("by_installation_id", (q) => q.eq("installationId", installationId))
    .unique();
};
