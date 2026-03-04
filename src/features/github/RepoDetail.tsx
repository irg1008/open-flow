import type { RepoFullName } from "#/github/validators";
import { NotFound } from "@/components/not-found";
import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";
import { RepoMarkdown } from "./RepoMarkdown";
import { useRepoDetail } from "./hooks/use-repo-detail";

export const RepoDetail = (props: RepoFullName) => {
  const { revalidateStatus, repo, isLoading } = useRepoDetail(props);

  if (revalidateStatus === 404) {
    return <NotFound />;
  }

  return (
    <section className="container scheme-only-light">
      {isLoading || !repo ? (
        <Spinner />
      ) : (
        <>
          <Button asChild>
            <a href={repo.htmlUrl} target="_blank" rel="noopener noreferrer">
              Go to github
            </a>
          </Button>

          <RepoMarkdown className="mx-auto max-w-4xl" repo={repo} expandible />
        </>
      )}
    </section>
  );
};
