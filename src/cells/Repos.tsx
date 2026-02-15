import type { Doc } from "#/_generated/dataModel";
import {
  Command,
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList
} from "@/components/ui/command";
import { InputGroup, InputGroupAddon, InputGroupInput } from "@/components/ui/input-group";
import { Spinner } from "@/components/ui/spinner";
import { useAsyncSearch } from "@/hooks/use-async-search";
import { withConvex } from "@/lib/convex";
import { useI18n } from "@zachhandley/ez-i18n-react";
import { GITHUB_SEARCH_TOKEN } from "astro:env/client";
import { SearchIcon } from "lucide-react";
import { useCallback, useState } from "react";
import { listRepos } from "shared/lib/github";

export const Repos = withConvex(() => {
  const { t } = useI18n();
  const [open, setOpen] = useState(false);

  const searchRepos = useCallback(
    async (searchQuery: string): Promise<Doc<"repoLists">["repos"]> => {
      const result = await listRepos({
        query: searchQuery,
        minStars: 0,
        limit: 10,
        token: GITHUB_SEARCH_TOKEN
      });
      return result.repos;
    },
    []
  );

  const {
    data: repos,
    isLoading,
    query,
    hasQuery,
    error,
    setQuery
  } = useAsyncSearch(searchRepos, {
    debounceMs: 1000
  });

  return (
    <>
      <InputGroup className="cursor-text" onClick={() => setOpen(true)}>
        <InputGroupAddon align="inline-start">
          <SearchIcon className="size-4" />
        </InputGroupAddon>
        <InputGroupInput
          value={query}
          readOnly
          placeholder={t("pages.home.repos.search-placeholder")}
          onFocus={() => setOpen(true)}
        />
      </InputGroup>

      <CommandDialog open={open} onOpenChange={setOpen} showCloseButton={false}>
        <Command shouldFilter={false}>
          <CommandInput
            value={query}
            onValueChange={setQuery}
            placeholder={t("pages.home.repos.search-placeholder")}
          />
          <CommandList>
            {isLoading && (
              <div className="flex items-center justify-center p-4">
                <Spinner />
              </div>
            )}

            {!isLoading && error && <p className="text-destructive p-2 text-sm">{error}</p>}

            {!isLoading && !error && (
              <>
                <CommandEmpty>
                  {hasQuery ? t("pages.home.repos.empty") : t("pages.home.repos.search-hint")}
                </CommandEmpty>
                <CommandGroup>
                  {repos?.map((repo) => (
                    <CommandItem
                      key={repo.id}
                      value={`${repo.owner?.login ? `${repo.owner.login}/` : ""}${repo.name}`}
                      onSelect={() => {
                        window.open(repo.htmlUrl, "_blank", "noopener,noreferrer");
                        setOpen(false);
                      }}
                    >
                      <div className="flex flex-col gap-1">
                        <span className="text-sm font-medium">
                          {repo.owner?.login ? `${repo.owner.login}/` : ""}
                          {repo.name}
                        </span>
                        <span className="text-muted-foreground text-xs">
                          {repo.description ?? t("pages.home.repos.no-description")}
                        </span>
                      </div>
                    </CommandItem>
                  ))}
                </CommandGroup>
              </>
            )}
          </CommandList>
        </Command>
      </CommandDialog>
    </>
  );
});
