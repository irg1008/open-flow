import { Octokit } from "@octokit/rest";
import { v } from "convex/values";
import { format, subDays } from "date-fns";
import { internal } from "../_generated/api";
import { Doc } from "../_generated/dataModel";
import { internalAction, internalMutation } from "../_generated/server";

const octokit = new Octokit();

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

export const listRepos = internalAction({
  args: {
    query: v.optional(v.string()),
    minStars: v.optional(v.number()),
    pastDays: v.optional(v.number()),
    limit: v.optional(v.number()),
    listName: v.string()
  },
  handler: async (ctx, { minStars = 500, pastDays, limit = 20, listName, query }) => {
    const queryParts = [`stars:>=${minStars}`];

    if (query) {
      queryParts.push(`${query} in:name,description`);
    }

    if (pastDays) {
      const createdAfterDate = format(subDays(new Date(), pastDays), "yyyy-MM-dd");
      queryParts.push(`created:>=${createdAfterDate}`);
    }

    const safeLimit = Math.min(100, Math.max(1, limit));

    const { data } = await octokit.search.repos({
      q: queryParts.join(" "),
      sort: "stars",
      order: "desc",
      per_page: safeLimit,
      page: 1
    });

    const repos: Doc<"repoLists">["repos"] = data.items.map((repo) => ({
      id: repo.id,
      name: repo.name,
      description: repo.description,
      stargazersCount: repo.stargazers_count,
      htmlUrl: repo.html_url,
      createdAt: repo.created_at,
      owner: repo.owner
        ? {
            name: repo.owner.name,
            login: repo.owner.login,
            avatarUrl: repo.owner.avatar_url,
            htmlUrl: repo.owner.html_url
          }
        : null
    }));

    await ctx.runMutation(internal.functions.github.saveRepoList, { name: listName, repos });
  }
});

export const saveRepoList = internalMutation({
  args: {
    name: v.string(),
    repos: v.array(repoValidator)
  },
  handler: async (ctx, { name, repos }) => {
    const normalizedName = name.trim();
    const data = { name: normalizedName, repos };

    const existingList = await ctx.db
      .query("repoLists")
      .withIndex("by_name", (q) => q.eq("name", normalizedName))
      .unique();

    if (!existingList) {
      return await ctx.db.insert("repoLists", data);
    }

    return await ctx.db.patch(existingList._id, data);
  }
});
