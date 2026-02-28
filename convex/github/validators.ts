import { Infer, v } from "convex/values";

export const vRepoFullName = v.object({
  owner: v.string(),
  name: v.string()
});

export type RepoFullName = Infer<typeof vRepoFullName>;

export const vAccountType = v.union(v.literal("User"), v.literal("Organization"));
export type AccountType = Infer<typeof vAccountType>;

export const vRepoDetail = v.object({
  externalId: v.number(),
  name: v.string(),
  description: v.optional(v.nullable(v.string())),
  branch: v.optional(v.string()),
  stargazersCount: v.optional(v.number()),
  htmlUrl: v.optional(v.string()),
  createdAt: v.optional(v.string()),
  ownerId: v.optional(v.number()),
  ownerName: v.optional(v.nullable(v.string())),
  ownerLogin: v.optional(v.nullable(v.string())),
  ownerAvatarUrl: v.optional(v.nullable(v.string())),
  ownerHtmlUrl: v.optional(v.nullable(v.string())),
  license: v.optional(v.nullable(v.string())),
  topics: v.optional(v.array(v.string())),
  private: v.optional(v.boolean()),
  unaccessible: v.optional(v.boolean()), // Flag to indicate if the repo is inaccessible (maybe private or deleted)
  integrationId: v.optional(v.id("githubIntegration")),
  etag: v.optional(v.string()) // Etag from GitHub API to manage cache invalidation
});
export type RepoDetail = Infer<typeof vRepoDetail>;

export const vRepoList = v.object({
  name: v.string(),
  repos: v.array(vRepoDetail)
});
export type RepoList = Infer<typeof vRepoList>;

export const vGithubIntegration = v.object({
  installationId: v.number(),
  suspended: v.optional(v.boolean()),
  suspendedAt: v.optional(v.nullable(v.string())),
  suspendedByName: v.optional(v.string()),
  installationClientId: v.optional(v.string()),
  repoSelectionAll: v.boolean(),
  accountId: v.optional(v.number()),
  accountName: v.optional(v.nullable(v.string())),
  accountAvatarUrl: v.optional(v.string()),
  accountType: v.optional(vAccountType)
});
export type GithubIntegration = Infer<typeof vGithubIntegration>;

export const vGithubUserIntegration = v.object({
  externalUserId: v.string(),
  installationId: v.number(),
  integrationId: v.id("githubIntegration")
});
export type GithubUserIntegration = Infer<typeof vGithubUserIntegration>;

export const vGithubUserIntegrationArgs = vGithubUserIntegration.omit("integrationId");
export type GithubUserIntegrationArgs = Infer<typeof vGithubUserIntegrationArgs>;
