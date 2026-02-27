import { Triggers } from "convex-helpers/server/triggers";
import { DataModel } from "./_generated/dataModel";
import { deleteIntegrationUsers } from "./github/shared";

export const triggers = new Triggers<DataModel>();

// Cascade delete for github integrations
triggers.register("githubIntegration", async (ctx, change) => {
  if (change.operation !== "delete") return;

  const repoDetails = ctx.db
    .query("repoDetail")
    .withIndex("by_integration_id", (q) => q.eq("integrationId", change.id));

  for await (const repo of repoDetails) {
    await ctx.db.patch("repoDetail", repo._id, { integrationId: undefined });
  }

  await deleteIntegrationUsers(ctx, change.oldDoc.installationId);
});
