import { RepoDetail } from "#/github/validators";
import { Octokit, type RestEndpointMethodTypes } from "@octokit/rest";
import { format, subDays } from "date-fns";
import { z } from "zod";

export enum RepoListsNames {
  LastMonth = "popular-last-month",
  AllTime = "popular-all-time"
}

export type GhRepo = Pick<
  RestEndpointMethodTypes["search"]["repos"]["response"]["data"]["items"][number],
  | "id"
  | "name"
  | "description"
  | "stargazers_count"
  | "html_url"
  | "created_at"
  | "owner"
  | "default_branch"
  | "license"
  | "topics"
>;

export const mapGithubRepo = (ghRepo: GhRepo, etag?: string): RepoDetail => ({
  externalId: ghRepo.id,
  name: ghRepo.name,
  description: ghRepo.description,
  branch: ghRepo.default_branch,
  stargazersCount: ghRepo.stargazers_count,
  htmlUrl: ghRepo.html_url,
  createdAt: ghRepo.created_at,
  ownerId: ghRepo.owner?.id,
  ownerName: ghRepo.owner?.name,
  ownerLogin: ghRepo.owner?.login,
  topics: ghRepo.topics,
  ownerAvatarUrl: ghRepo.owner?.avatar_url,
  ownerHtmlUrl: ghRepo.owner?.html_url,
  license: ghRepo.license?.key,
  etag
});

export const createHeaders = (
  token?: string,
  optional: Record<string, string | undefined> = {}
) => {
  const headers = Object.entries(optional).reduce<Record<string, string>>((acc, [key, value]) => {
    if (value) acc[key] = value;
    return acc;
  }, {});

  if (token) {
    headers.Authorization = `Token ${token}`;
  }

  return headers;
};

const httpErrorSchema = z.object({
  response: z.object({
    status: z.number()
  })
});

const octokit = new Octokit();

export type ListRepoOptions = {
  query?: string;
  limit?: number;
  minStars?: number;
  pastDays?: number;
  token?: string;
};

const listRepos = async (options: ListRepoOptions) => {
  const { query, limit = 20, minStars = 500, pastDays, token } = options;

  const safeLimit = Math.min(100, Math.max(1, limit));
  const headers = createHeaders(token);

  const queryParts = [`stars:>=${minStars}`];

  if (query) {
    queryParts.push(`${query} in:name,description,owner`);
  }

  if (pastDays) {
    const createdAfterDate = format(subDays(new Date(), pastDays), "yyyy-MM-dd");
    queryParts.push(`created:>=${createdAfterDate}`);
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

  const repos = data.items.map((ghRepo) => mapGithubRepo(ghRepo));
  return { repos, count: data.total_count, rateLimitRemaining, rateLimitReached, rateLimitMs };
};

export type GetRepoOptions = {
  etag?: string;
  owner: string;
  name: string;
  token?: string;
};

const getRepo = async ({ etag, owner, name, token }: GetRepoOptions) => {
  try {
    const headers = createHeaders(token, { "if-none-match": etag });
    const response = await octokit.repos.get({ owner, repo: name, headers });

    const { data, headers: responseHeaders, status } = response;
    return { status, repo: mapGithubRepo(data, responseHeaders.etag) };
  } catch (error) {
    const httpError = httpErrorSchema.safeParse(error);
    if (!httpError.success) throw error;
    return { status: httpError.data.response.status, repo: null }; // Possible status 304 Not Modified or 404 Not Found.
  }
};

export const github = {
  listRepos,
  getRepo
};
