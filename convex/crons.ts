import { cronJobs } from "convex/server";
import { RepoListsNames } from "shared/lib/github";
import { internal } from "./_generated/api";

const crons = cronJobs();

crons.daily(
  "popular-github-repos-last-month",
  { hourUTC: 6, minuteUTC: 0 },
  internal.github.actions.fetchRepos,
  { minStars: 5_000, pastDays: 30, limit: 10, listName: RepoListsNames.LastMonth }
);

crons.daily(
  "popular-github-repos-last-year",
  { hourUTC: 6, minuteUTC: 0 },
  internal.github.actions.fetchRepos,
  { minStars: 20000, pastDays: 365, limit: 15, listName: RepoListsNames.LastYear }
);

crons.daily(
  "popular-github-repos-all-time",
  { hourUTC: 6, minuteUTC: 0 },
  internal.github.actions.fetchRepos,
  { minStars: 100_000, limit: 20, listName: RepoListsNames.AllTime }
);

crons.hourly("popular-github-repos-today", { minuteUTC: 0 }, internal.github.actions.fetchRepos, {
  minStars: 200,
  pastDays: 1,
  limit: 10,
  listName: RepoListsNames.Today
});

export default crons;
