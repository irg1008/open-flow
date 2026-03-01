import type { Doc } from "#/_generated/dataModel";
import { RepoDetail } from "#/github/validators";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { parseRemoteGithubMarkdown } from "@/lib/markdown";
import { useReactQuery } from "@/lib/react-query";
import { cn } from "@/lib/utils";
import { useEffect, useState } from "react";

const fetchRepoMarkdown = async (repo: RepoDetail) => {
  if (!repo.branch || !repo.ownerLogin) return;
  return await parseRemoteGithubMarkdown(repo.ownerLogin, repo.name, repo.branch);
};

type CollapseProps =
  | {
      expandible: true;
      expanded?: boolean;
    }
  | {
      expandible?: false;
      expanded?: never;
    };

export type RepoDetailMarkdownProps = {
  repo: Doc<"repoDetail">;
} & CollapseProps &
  React.ComponentProps<"div">;

export const RepoDetailMarkdown = ({
  repo,
  expandible,
  expanded: initialExpanded,
  ...props
}: RepoDetailMarkdownProps) => {
  const { data: markdownContent } = useReactQuery({
    queryKey: ["repoDetailMarkdown", repo._id],
    queryFn: () => fetchRepoMarkdown(repo)
  });

  const [expanded, setExpanded] = useState(initialExpanded ?? false);

  let shouldShowReadMore = expandible && !expanded;
  shouldShowReadMore &&= !!markdownContent && markdownContent.length > 2500;

  useEffect(() => {
    setExpanded(initialExpanded ?? false);
  }, [repo._id, initialExpanded]);

  return (
    markdownContent && (
      <Card {...props}>
        <CardContent className={cn("relative", shouldShowReadMore && "max-h-96 overflow-hidden")}>
          <section className="typography" dangerouslySetInnerHTML={{ __html: markdownContent }} />

          {shouldShowReadMore && (
            <aside className="from-card pointer-events-none absolute inset-x-0 bottom-0 h-20 bg-linear-to-t to-transparent" />
          )}
        </CardContent>

        {shouldShowReadMore && (
          <CardFooter className="pt-0">
            <Button onClick={() => setExpanded(true)}>Read more</Button>
          </CardFooter>
        )}
      </Card>
    )
  );
};
