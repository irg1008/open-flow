import { Octokit } from "@octokit/rest";
import { v } from "convex/values";
import { format, subDays } from "date-fns";
import { internal } from "../_generated/api";
import { Doc } from "../_generated/dataModel";
import { internalAction } from "../_generated/server";

const octokit = new Octokit();

export const listRepos = internalAction({
  args: {
    listName: v.string(),
    pastDays: v.optional(v.number()),
    query: v.optional(v.string()),
    minStars: v.optional(v.number()),
    limit: v.optional(v.number())
  },
  handler: async (ctx, { listName, pastDays, query, minStars = 500, limit = 20 }) => {
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

    await ctx.runMutation(internal.github.mutations.saveRepoList, {
      name: listName,
      repos
    });
  }
});
