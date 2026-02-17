import { v } from "convex/values";
import { mutation } from "../_generated/server";

export const create = mutation({
  args: {
    author: v.string(),
    content: v.string()
  },
  handler: async (ctx, args) => {
    await ctx.db.insert("comment", {
      author: args.author,
      content: args.content
    });
  }
});
