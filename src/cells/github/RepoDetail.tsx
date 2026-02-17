import type { RepoFullName } from "#/github/validators";
import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";
import { useAsync } from "@/hooks/use-async";
import { api, useAction, useQuery, withConvex } from "@/lib/convex";
import { navigate } from "astro:transitions/client";
import { RepoDetailMarkdown } from "./RepoMarkdown";

export const RepoDetail = withConvex((props: RepoFullName) => {
  const repo = useQuery(api.github.queries.getRepoDetail, props);

  const revalidateRepo = useAction(api.github.actions.fetchRepoDetail);
  const { data: status, isLoading } = useAsync(revalidateRepo, props);

  if (status === 404) {
    navigate("/not-found", { state: { from: location.pathname } });
  }

  return (
    <section className="container">
      {isLoading || (!repo && <Spinner />)}

      {repo && (
        <>
          <Button asChild>
            <a href={repo.htmlUrl} target="_blank" rel="noopener noreferrer">
              Go to github
            </a>
          </Button>

          <RepoDetailMarkdown repo={repo} />
        </>
      )}
    </section>
  );
});
