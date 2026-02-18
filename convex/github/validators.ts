import { Infer, v } from "convex/values";

export const repoValidator = v.object({
  id: v.number(),
  name: v.string(),
  description: v.nullable(v.string()),
  branch: v.optional(v.string()),
  stargazersCount: v.number(),
  htmlUrl: v.string(),
  createdAt: v.string(),
  ownerName: v.optional(v.nullable(v.string())),
  ownerLogin: v.optional(v.nullable(v.string())),
  ownerAvatarUrl: v.optional(v.nullable(v.string())),
  ownerHtmlUrl: v.optional(v.nullable(v.string())),
  license: v.optional(v.nullable(v.string())),
  topics: v.optional(v.array(v.string())),
  etag: v.optional(v.string()), // Etag from GitHub API to manage cache invalidation
  claimed: v.optional(v.boolean()) // Whether this repo has been claimed by a user in our app
});

export const repoFullNameValidator = v.object({
  owner: v.string(),
  name: v.string()
});

export type RepoFullName = Infer<typeof repoFullNameValidator>;

export const repoFullNameWithEtagValidator = repoFullNameValidator.extend({
  etag: v.optional(v.string())
});
