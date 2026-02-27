import {} from "convex-helpers/validators";
import { Infer, v } from "convex/values";

export const repoValidator = v.object({
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

export type Repo = Infer<typeof repoValidator>;

export const repoFullNameValidator = v.object({
  owner: v.string(),
  name: v.string()
});

export type RepoFullName = Infer<typeof repoFullNameValidator>;

export const repoFullNameWithEtagValidator = repoFullNameValidator.extend({
  etag: v.optional(v.string())
});

export const fetchRepoResponseValidator = v.object({
  status: v.number(),
  repo: v.optional(v.nullable(repoValidator))
});

export type FetchRepoResponse = Infer<typeof fetchRepoResponseValidator>;

export const accountTypeValidator = v.union(v.literal("User"), v.literal("Organization"));

export type AccountType = Infer<typeof accountTypeValidator>;

export const githubInstallationValidator = v.object({
  installationId: v.number(),
  suspended: v.optional(v.boolean()),
  suspendedAt: v.optional(v.nullable(v.string())),
  suspendedByName: v.optional(v.string()),
  installationClientId: v.optional(v.string()),
  repoSelectionAll: v.boolean(),
  accountId: v.optional(v.number()),
  accountName: v.optional(v.nullable(v.string())),
  accountAvatarUrl: v.optional(v.string()),
  accountType: v.optional(accountTypeValidator)
});

export type GithubInstallation = Infer<typeof githubInstallationValidator>;

export const githubUserInstallationValidator = v.object({
  externalUserId: v.string(),
  installationId: v.number()
});

export const githubUserIntegrationValidator = githubUserInstallationValidator.extend({
  integrationId: v.id("githubIntegration")
});

export type GithubUserInstallation = Infer<typeof githubUserInstallationValidator>;
