import { typedV } from "convex-helpers/validators";
import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";
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

  githubUserIntegration: defineTable(githubUserIntegrationValidator)
    .index("by_installation_external_user", ["installationId", "externalUserId"])
    .index("by_external_user_id", ["externalUserId"])
});

export const vv = typedV(schema);
export default schema;
