import { Html } from "@/components/html";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { m } from "@/i18n/_generated/messages";
import { UserTheme } from "@/lib/theme";
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
  htmlMarkdown: string;
  theme?: UserTheme;
} & CollapseProps &
  React.ComponentProps<"div">;

export const RepoMarkdown = ({
  htmlMarkdown,
  theme,
  expandible,
  expanded: initialExpanded,
  ...props
}: RepoDetailMarkdownProps) => {
  const [expanded, setExpanded] = useState(initialExpanded ?? false);

  const markdownTooLong = htmlMarkdown.length > 2500;
  const shouldShowReadMore = markdownTooLong && expandible && !expanded;

  useEffect(() => {
    setExpanded(initialExpanded ?? false);
  }, [initialExpanded]);

  return (
    <Card {...props}>
      <CardContent className={cn("relative", shouldShowReadMore && "max-h-96 overflow-hidden")}>
        <Html as="article" content={htmlMarkdown} theme={theme} />

        {shouldShowReadMore && (
          <aside className="from-card pointer-events-none absolute inset-x-0 bottom-0 h-20 bg-linear-to-t to-transparent" />
        )}
      </CardContent>

      {shouldShowReadMore && (
        <CardFooter className="pt-0">
          <Button onClick={() => setExpanded(true)}>{m.repos_markdown_read_more()}</Button>
        </CardFooter>
      )}
    </Card>
  );
};
