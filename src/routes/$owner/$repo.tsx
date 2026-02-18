import { RepoDetail } from "@/cells/github/RepoDetail";
import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/$owner/$repo")({
  component: RepoPage
});

function RepoPage() {
  const { owner, repo } = Route.useParams();
  return <RepoDetail owner={owner} name={repo} />;
}
