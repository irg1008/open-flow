import { RepoFundings } from "@/features/github/components/repo-fundings";
import { RepoMarkdown } from "@/features/github/components/repo-markdown";
import { parseRemoteGithubFunding, parseRemoteGithubMarkdown } from "@/features/github/lib/github";
import { RepoDetail } from "@/features/github/RepoDetail";
import { seo } from "@/lib/seo";
import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/$owner/$repo")({
  ssr: false,
  loader: async ({ params }) => ({
    markdown: await parseRemoteGithubMarkdown(params),
    funding: await parseRemoteGithubFunding(params)
  }),
  staleTime: 5 * 60 * 1000, // 5 minutes
  preloadStaleTime: 10 * 60 * 1000, // 10 minutes
  head: ({ params }) => ({ meta: seo({ title: `${params.owner}/${params.repo}` }) }),
  component: RepoPage
});

function RepoPage() {
  const { owner, repo } = Route.useParams();
  const { markdown, funding } = Route.useLoaderData();

  return (
    <section className="container scheme-only-light">
      <RepoDetail owner={owner} name={repo} />
      {funding && <RepoFundings funding={funding} />}
      {markdown && <RepoMarkdown className="mx-auto max-w-4xl" markdown={markdown} expandible />}
    </section>
  );
}
