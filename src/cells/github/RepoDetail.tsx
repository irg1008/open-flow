import type { RepoFullName } from "#/github/validators";
import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";
import { api, useAction, useQuery } from "@/lib/convex";
import { useReactQuery } from "@/lib/react-query";
import { RepoDetailMarkdown } from "./RepoMarkdown";

export const RepoDetail = (props: RepoFullName) => {
  const repo = useQuery(api.github.queries.getRepoDetail, props);
  const revalidateRepo = useAction(api.github.actions.fetchRepoDetail);

  const { data: status, isLoading } = useReactQuery({
    queryKey: ["repoDetail", props.owner, props.name],
    queryFn: () => revalidateRepo(props)
  });

  if (status === 404) {
    return (
      <section className="container py-8">
        <p className="text-muted-foreground">Repository not found.</p>
      </section>
    );
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
};
