import type { Doc } from "#/_generated/dataModel";
import type { RepoFullName } from "#/github/validators";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Spinner } from "@/components/ui/spinner";
import { useAsync } from "@/hooks/use-async";
import { api, useAction, useQuery, withConvex } from "@/lib/convex";
import { navigate } from "astro:transitions/client";
import { useEffect, useState } from "react";
import { parseRemoteGithubMarkdown } from "shared/lib/markdown";

export const RepoDetail = withConvex((props: RepoFullName) => {
  const repo = useQuery(api.github.queries.getRepoDetail, props);

  const revalidateRepo = useAction(api.github.actions.fetchRepoDetail);
  const { data: status, isLoading } = useAsync(revalidateRepo, props);

  if (status === 404) {
    navigate("/not-found", { state: { from: location.pathname } });
  }

  return (
    <span>
      {isLoading || !repo ? (
        <Spinner />
      ) : (
        <>
          <Button>
            <a href={repo.htmlUrl} target="_blank" rel="noopener noreferrer">
              Go to github
            </a>
          </Button>
        </>
      )}
      {repo && <RepoDetailMarkdown repo={repo} />}
    </span>
  );
});

const RepoDetailMarkdown = ({ repo }: { repo: Doc<"repoDetail"> }) => {
  const [markdownContent, setMarkdownContent] = useState<string | null>(null);

  useEffect(() => {
    const fetchReadme = async () => {
      if (!repo.branch || !repo.ownerLogin) return;
      const content = await parseRemoteGithubMarkdown(repo.ownerLogin, repo.name, repo.branch);
      setMarkdownContent(content);
    };

    fetchReadme();
  }, [repo]);

  return (
    markdownContent && (
      <article className="container">
        <Card>
          <CardContent
            className="typography"
            dangerouslySetInnerHTML={{ __html: markdownContent }}
          />
        </Card>
      </article>
    )
  );
};
