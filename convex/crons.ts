import { cronJobs } from "convex/server";
import { internal } from "./_generated/api";

const crons = cronJobs();

crons.daily(
  "popular-repos-last-month",
  { hourUTC: 6, minuteUTC: 0 },
  internal.functions.github.listRepos,
  { minStars: 2_000, pastDays: 30, listName: "popular-repos-last-month" }
);

crons.daily(
  "popular-repos-all-time",
  { hourUTC: 6, minuteUTC: 0 },
  internal.functions.github.listRepos,
  { minStars: 100_000, listName: "popular-repos-all-time" }
);

export default crons;
