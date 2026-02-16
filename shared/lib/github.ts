import type { Doc } from "#/_generated/dataModel";
import { Octokit } from "@octokit/rest";
import { format, subDays } from "date-fns";

const octokit = new Octokit();

export type ListRepoOptions = {
  query?: string;
  limit?: number;
  minStars?: number;
  pastDays?: number;
  token?: string;
};

// return of proimise
export type ListReposResult = Awaited<ReturnType<typeof listRepos>>;

export enum RepoListsNames {
  LastMonth = "popular-last-month",
  AllTime = "popular-all-time"
}

export const listRepos = async (options: ListRepoOptions) => {
  const { query, limit = 20, minStars = 500, pastDays, token } = options;

  const queryParts = [`stars:>=${minStars}`];

  if (query) {
    queryParts.push(`${query} in:name,description`);
  }

  if (pastDays) {
    const createdAfterDate = format(subDays(new Date(), pastDays), "yyyy-MM-dd");
    queryParts.push(`created:>=${createdAfterDate}`);
  }

  const safeLimit = Math.min(100, Math.max(1, limit));

  const headers: Record<string, string> = {};
  if (token) {
    headers.Authorization = `Token ${token}`;
  }

  const { data, headers: responseHeaders } = await octokit.search.repos({
    q: queryParts.join(" "),
    sort: "stars",
    order: "desc",
    per_page: safeLimit,
    page: 1,
    headers
  });

  const { "x-ratelimit-reset": _xRateLimitReset, "x-ratelimit-remaining": _xRateLimitRemaining } =
    responseHeaders;

  const rateLimitReset = _xRateLimitReset ? parseInt(_xRateLimitReset, 10) : undefined;
  const rateLimitRemaining = _xRateLimitRemaining ? parseInt(_xRateLimitRemaining, 10) : undefined;
  const rateLimitReached = rateLimitRemaining === 0;
  const rateLimitMs = rateLimitReset ? rateLimitReset * 1000 - Date.now() : undefined;

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

  return { repos, count: data.total_count, rateLimitRemaining, rateLimitReached, rateLimitMs };
};
