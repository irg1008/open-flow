import { v } from "convex/values";

export const repoValidator = v.object({
  id: v.number(),
  name: v.string(),
  description: v.nullable(v.string()),
  stargazersCount: v.number(),
  htmlUrl: v.string(),
  createdAt: v.string(),
  owner: v.nullable(
    v.object({
      name: v.optional(v.nullable(v.string())),
      login: v.string(),
      avatarUrl: v.string(),
      htmlUrl: v.string()
    })
  )
});
