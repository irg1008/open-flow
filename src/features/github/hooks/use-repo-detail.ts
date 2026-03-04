import { api } from "#/_generated/api";
import { RepoFullName } from "#/github/validators";
import { useAction, useQuery } from "@/lib/convex";
import { useReactQuery } from "@/lib/react-query";
import { useNavigate } from "@tanstack/react-router";
import { useCallback, useEffect } from "react";

export const useRepoDetail = (args: RepoFullName) => {
  const navigate = useNavigate();

  const repo = useQuery(api.github.queries.getRepoDetail, args);

  const revalidateRepo = useAction(api.github.actions.fetchRepoDetail);
  const { data, isLoading } = useReactQuery({
    queryKey: ["repoDetail", args.owner, args.name],
    queryFn: () => revalidateRepo(args)
  });

  // Called if repo has been recently moved/renamed.
  const navigateToNewLocation = useCallback(async () => {
    if (data?.status !== 200 || !data?.repo) return;

    const { ownerLogin, name } = data.repo;
    if (!ownerLogin || !name) return;

    await navigate({
      to: "/$owner/$repo",
      params: { owner: ownerLogin, repo: name },
      replace: true
    });
  }, [navigate, data]);

  useEffect(() => {
    void navigateToNewLocation();
  }, [navigateToNewLocation]);

  return { revalidateStatus: data?.status, repo, isLoading };
};
