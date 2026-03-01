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
import { api, useQuery } from "@/lib/convex";
import { Link } from "@tanstack/react-router";
import { LayoutListIcon, StarIcon } from "lucide-react";
import { RepoListsNames } from "shared/lib/github";

type RepoListProps = {
  name: RepoListsNames;
  title: string;
};

export const RepoList = (props: RepoListProps) => {
  const { isPending, data } = useQuery(api.github.queries.getRepoList, { listName: props.name });

  if (!isPending && !data) {
    return (
      <Empty>
        <EmptyHeader>
          <EmptyMedia variant="icon">
            <LayoutListIcon />
          </EmptyMedia>
          <EmptyTitle>{m.repos_list_not_found_title()}</EmptyTitle>
          <EmptyDescription>
            {m.repos_list_not_found_description()} ({props.name})
          </EmptyDescription>
        </EmptyHeader>
      </Empty>
    );
  }

  return (
    <Card className="flex-1">
      <CardContent className="space-y-4">
        <h2 className="text-lg font-semibold">{props.title}</h2>
        <ItemGroup>
          {isPending && (
            <>
              {Array.from({ length: 10 }).map((_, i) => (
                <Skeleton key={i} className="h-16 w-full" />
              ))}
            </>
          )}
          {data?.repoDetails.map(
            (repo) =>
              repo && (
                <Item key={repo._id} variant="outline" size="sm" className="flex-row" asChild>
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
