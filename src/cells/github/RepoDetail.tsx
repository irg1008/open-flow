import type { Doc } from "#/_generated/dataModel";
import type { RepoFullName } from "#/github/validators";
import { Spinner } from "@/components/ui/spinner";
import { api, useAction, useQuery, withConvex } from "@/lib/convex";
import { navigate } from "astro:transitions/client";
import { useEffect, useState } from "react";
import { parseRemoteGithubMarkdown } from "shared/lib/markdown";

export const RepoDetail = withConvex((props: RepoFullName) => {
  const repo = useQuery(api.github.queries.getRepoDetail, props);
  const fetchRepoDetail = useAction(api.github.actions.fetchRepoDetail);

  useEffect(() => {
    // On load, start action to check stale repo data
    const checkStaleRepo = async () => {
      const status = await fetchRepoDetail(props);
      if (status === 404) {
        navigate("/not-found", { state: { from: location.pathname } });
      }
    };

    checkStaleRepo();
  }, [fetchRepoDetail, props]);

  return (
    <span>
      {repo === undefined && <Spinner />}
      {repo?.name}
      {repo?.stargazersCount}
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
    <article
      className="typography container"
      dangerouslySetInnerHTML={{ __html: markdownContent ?? "" }}
    />
  );
};
