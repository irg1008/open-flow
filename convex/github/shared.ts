import { Doc, Id } from "#/_generated/dataModel";
import { MutationCtx, QueryCtx } from "#/_generated/server";
import { getAuth } from "#/auth";
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

export const getExternalId = async (ctx: QueryCtx) => {
  const { auth, headers } = await getAuth(ctx);

  const accounts = await auth.api.listUserAccounts({ headers });
  const githubAccount = accounts.find((account) => account.providerId === "github");

  const externalId = githubAccount?.accountId;
  if (!externalId) {
    throw new Error(
      "No github account connected. Dev note: If logged in with a non-github account, additional log-in step is required to be implemented"
    );
  }

  return externalId;
};

export const getIntegrationUser = async (
  ctx: QueryCtx,
  installationId: number,
  externalUserId: string
) => {
  return await ctx.db
    .query("githubUserIntegration")
    .withIndex("by_installation_external_user", (q) =>
      q.eq("installationId", installationId).eq("externalUserId", externalUserId)
    )
    .unique();
};

export const deleteIntegrationUsers = async (ctx: MutationCtx, installationId: number) => {
  const userIntegrations = ctx.db
    .query("githubUserIntegration")
    .withIndex("by_installation_external_user", (q) => q.eq("installationId", installationId));

  for await (const userIntegration of userIntegrations) {
    await ctx.db.delete("githubUserIntegration", userIntegration._id);
  }
};
