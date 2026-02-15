import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";
import { repoValidator } from "./github/validators";

export default defineSchema({
  comments: defineTable({
    author: v.string(),
    content: v.string()
  }),

  repoLists: defineTable({
    name: v.string(),
    repos: v.array(repoValidator)
  }).index("by_name", ["name"])
});
