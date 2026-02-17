import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";
import { repoValidator } from "./github/validators";

export default defineSchema({
  comment: defineTable({
    author: v.string(),
    content: v.string()
  }),

  repoList: defineTable({
    name: v.string(),
    repos: v.array(repoValidator)
  }).index("by_name", ["name"]),

  repoDetail: defineTable(repoValidator).index("by_full_name", ["ownerLogin", "name"])
});
