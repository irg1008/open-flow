import { Avatar, AvatarImage } from "@/components/ui/avatar";
import { Card, CardContent } from "@/components/ui/card";
import {
  Empty,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle
} from "@/components/ui/empty";
import {
  Item,
  ItemActions,
  ItemContent,
  ItemDescription,
  ItemGroup,
  ItemMedia,
  ItemTitle
} from "@/components/ui/item";
import { Skeleton } from "@/components/ui/skeleton";
import { m } from "@/i18n/_generated/messages";
import { api, useStateQuery } from "@/lib/convex";
import { Link } from "@tanstack/react-router";
import { LayoutListIcon, StarIcon } from "lucide-react";
import { RepoListsNames } from "shared/lib/github";

type RepoListProps = {
  name: RepoListsNames;
  title: string;
  placeholderLength?: number;
};

export const RepoList = ({ name, title, placeholderLength = 10 }: RepoListProps) => {
  const { isPending, data } = useStateQuery(api.github.queries.getRepoList, { listName: name });

  if (!isPending && !data) {
    return (
      <Empty>
        <EmptyHeader>
          <EmptyMedia variant="icon">
            <LayoutListIcon />
          </EmptyMedia>
          <EmptyTitle>{m.repos_list_not_found_title()}</EmptyTitle>
          <EmptyDescription>
            {m.repos_list_not_found_description()} ({title})
          </EmptyDescription>
        </EmptyHeader>
      </Empty>
    );
  }

  return (
    <Card>
      <CardContent className="space-y-4">
        <h2 className="text-lg font-semibold">{title}</h2>
        <ItemGroup>
          {isPending && (
            <>
              {Array.from({ length: placeholderLength }).map((_, i) => (
                <Skeleton key={i} className="h-16 w-full" />
              ))}
            </>
          )}
          {data?.repoDetails.map(
            (repo) =>
              repo && (
                <Item key={repo._id} asChild variant="outline" size="sm">
                  <Link
                    to="/$owner/$repo"
                    disabled={!repo.ownerLogin}
                    params={{ owner: repo.ownerLogin!, repo: repo.name }}
                  >
                    {repo.ownerAvatarUrl && (
                      <ItemMedia>
                        <Avatar>
                          <AvatarImage
                            src={repo.ownerAvatarUrl}
                            alt={repo.ownerLogin || undefined}
                          />
                        </Avatar>
                      </ItemMedia>
                    )}

                    <ItemContent>
                      <ItemTitle>
                        {repo.ownerLogin ? `${repo.ownerLogin}/ ` : ""}
                        {repo.name}
                      </ItemTitle>
                      <ItemDescription className="line-clamp-1">
                        {repo.description || m.repos_no_description()}
                      </ItemDescription>
                    </ItemContent>

                    <ItemActions className="text-sm">
                      <StarIcon size={14} />
                      {repo.stargazersCount ?? "-"}
                    </ItemActions>
                  </Link>
                </Item>
              )
          )}
        </ItemGroup>
      </CardContent>
    </Card>
  );
};
