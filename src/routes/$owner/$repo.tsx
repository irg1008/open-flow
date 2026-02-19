import { RepoDetail } from "@/cells/github/RepoDetail";
import { seo } from "@/lib/seo";
import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/$owner/$repo")({
  head: ({ params }) => ({ meta: seo({ title: `${params.owner}/${params.repo}` }) }),
  component: RepoPage
});

function RepoPage() {
  const { owner, repo } = Route.useParams();
  return <RepoDetail owner={owner} name={repo} />;
}
