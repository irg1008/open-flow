import { typedV } from "convex-helpers/validators";
import { defineSchema, defineTable } from "convex/server";
import {
  vGithubIntegration,
  vGithubUserIntegration,
  vRepoDetail,
  vRepoList
} from "./github/validators";

const schema = defineSchema({
  repoDetail: defineTable(vRepoDetail)
    .index("by_integration_id", ["integrationId", "private"])
    .index("by_external_id", ["externalId"])
    .index("by_full_name", ["ownerLogin", "name"]),

  repoList: defineTable(vRepoList).index("by_name", ["name"]),

  githubIntegration: defineTable(vGithubIntegration).index("by_installation_id", [
    "installationId"
  ]),

  githubUserIntegration: defineTable(vGithubUserIntegration)
    .index("by_integration_id", ["integrationId"])
    .index("by_installation_external_user", ["installationId", "externalUserId"])
    .index("by_external_user_id", ["externalUserId"])
});

export const vv = typedV(schema);
export default schema;
