import { Triggers } from "convex-helpers/server/triggers";
import { typedV } from "convex-helpers/validators";
import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";
import { DataModel } from "./_generated/dataModel";
import {
  githubInstallationValidator,
  githubUserIntegrationValidator,
  repoValidator
} from "./github/validators";

const schema = defineSchema({
  repoList: defineTable({
    name: v.string(),
    repos: v.array(repoValidator)
  }).index("by_name", ["name"]),

  repoDetail: defineTable(repoValidator)
    .index("by_external_id", ["externalId"])
    .index("by_integration_id", ["integrationId"])
    .index("by_full_name", ["ownerLogin", "name"]),

  githubIntegration: defineTable(githubInstallationValidator).index("by_installation_id", [
    "installationId"
  ]),

  githubUserIntegration: defineTable(githubUserIntegrationValidator).index("by_installation_user", [
    "installationId",
    "userId"
  ])
});

export const vv = typedV(schema);
export default schema;

const triggers = new Triggers<DataModel>();

// Cascade delete integration references
triggers.register("githubIntegration", async (ctx, change) => {
  if (change.operation !== "delete") return;

  const repoDetails = ctx.db
    .query("repoDetail")
    .withIndex("by_integration_id", (q) => q.eq("integrationId", change.id));

  for await (const repo of repoDetails) {
    await ctx.db.patch("repoDetail", repo._id, { integrationId: undefined });
  }

  const userIntegrations = ctx.db
    .query("githubUserIntegration")
    .withIndex("by_installation_user", (q) => q.eq("installationId", change.oldDoc.installationId));

  for await (const userIntegration of userIntegrations) {
    await ctx.db.delete("githubUserIntegration", userIntegration._id);
  }
});
