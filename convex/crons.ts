import { cronJobs } from "convex/server";
import { RepoListsNames } from "shared/lib/github";
import { internal } from "./_generated/api";

const crons = cronJobs();

crons.daily(
  "popular-github-repos-last-month",
  { hourUTC: 6, minuteUTC: 0 },
  internal.github.actions.listRepos,
  { minStars: 2_000, pastDays: 30, listName: RepoListsNames.LastMonth }
);

crons.daily(
  "popular-github-repos-all-time",
  { hourUTC: 6, minuteUTC: 0 },
  internal.github.actions.listRepos,
  { minStars: 100_000, listName: RepoListsNames.AllTime }
);

export default crons;
