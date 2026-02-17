import type { Doc } from "#/_generated/dataModel";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { useAsync } from "@/hooks/use-async";
import { useEffect, useRef, useState } from "react";
import type { Repo } from "shared/lib/github";
import { parseRemoteGithubMarkdown } from "shared/lib/markdown";

const fetchRepoMarkdown = async (repo: Repo) => {
  if (!repo.branch || !repo.ownerLogin) return;
  return await parseRemoteGithubMarkdown(repo.ownerLogin, repo.name, repo.branch);
};

export const RepoDetailMarkdown = ({ repo }: { repo: Doc<"repoDetail"> }) => {
  const { data: markdownContent } = useAsync(fetchRepoMarkdown, repo);

  const [expanded, setExpanded] = useState(false);
  const [isOverflowing, setIsOverflowing] = useState(false);
  const contentRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = contentRef.current;
    if (!el || !markdownContent) return;
    setIsOverflowing(el.scrollHeight > 200);
  }, [markdownContent]);

  useEffect(() => {
    setExpanded(false);
  }, [repo.id]);

  return (
    markdownContent && (
      <Card>
        <CardContent
          className={`relative ${!expanded && isOverflowing ? "max-h-80 overflow-hidden" : ""}`}
        >
          <section
            ref={contentRef}
            className="typography"
            dangerouslySetInnerHTML={{ __html: markdownContent }}
          />

          {!expanded && isOverflowing && (
            <aside className="from-card pointer-events-none absolute inset-x-0 bottom-0 h-20 bg-linear-to-t to-transparent" />
          )}
        </CardContent>

        {!expanded && isOverflowing && (
          <CardFooter className="pt-0">
            <Button onClick={() => setExpanded(true)}>Read more</Button>
          </CardFooter>
        )}
      </Card>
    )
  );
};
