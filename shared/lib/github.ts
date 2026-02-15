import type { Doc } from "#/_generated/dataModel";
import { Octokit } from "@octokit/rest";
import { format, subDays } from "date-fns";

const octokit = new Octokit();

export type ListRepoOptions = {
  query?: string;
  limit?: number;
  minStars?: number;
  pastDays?: number;
};

export enum RepoListsNames {
  LastMonth = "popular-last-month",
  AllTime = "popular-all-time"
}

export const listRepos = async (options: ListRepoOptions) => {
  const { query, limit = 20, minStars = 500, pastDays } = options;

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

  return { repos, count: data.total_count };
};
