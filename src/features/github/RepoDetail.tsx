import type { RepoFullName } from "#/github/validators";
import { NotFound } from "@/components/not-found";
import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";
import { useRepoDetail } from "./hooks/use-repo-detail";

type RepoDetailProps = RepoFullName;

export const RepoDetail = ({ owner, name }: RepoDetailProps) => {
  const { revalidateStatus, repo, isLoading } = useRepoDetail({ owner, name });

  if (revalidateStatus === 404) {
    return <NotFound />;
  }

  if (isLoading || !repo) {
    return <Spinner />;
  }

  return (
    <>
      <Button asChild>
        <a href={repo.htmlUrl} target="_blank" rel="noopener noreferrer">
          Go to github
        </a>
      </Button>
    </>
  );
};
