import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { useEffect, useState } from "react";

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
  markdown: string;
} & CollapseProps &
  React.ComponentProps<"div">;

export const RepoMarkdown = ({
  markdown,
  expandible,
  expanded: initialExpanded,
  ...props
}: RepoDetailMarkdownProps) => {
  const [expanded, setExpanded] = useState(initialExpanded ?? false);

  let shouldShowReadMore = expandible && !expanded;
  shouldShowReadMore &&= !!markdown && markdown.length > 2500;

  useEffect(() => {
    setExpanded(initialExpanded ?? false);
  }, [initialExpanded]);

  return (
    markdown && (
      <Card {...props}>
        <CardContent className={cn("relative", shouldShowReadMore && "max-h-96 overflow-hidden")}>
          <section className="typography" dangerouslySetInnerHTML={{ __html: markdown }} />

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
