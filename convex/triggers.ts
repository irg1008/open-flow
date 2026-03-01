import { Triggers } from "convex-helpers/server/triggers";
import { DataModel } from "./_generated/dataModel";
import { deleteIntegrationUsers, unlinkIntegrationRepos } from "./github/shared";

export const triggers = new Triggers<DataModel>();

// Cascade delete for github integrations
triggers.register("githubIntegration", async (ctx, change) => {
  if (change.operation !== "delete") return;

  await unlinkIntegrationRepos(ctx, change.id);
  await deleteIntegrationUsers(ctx, change.id);
});
