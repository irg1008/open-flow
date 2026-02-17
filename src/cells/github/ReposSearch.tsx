import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
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
import { useKeyDown } from "@/hooks/use-key-down";
import { withConvex } from "@/lib/convex";
import { useI18n } from "@zachhandley/ez-i18n-react";
import { navigate } from "astro:transitions/client";
import { AlertCircleIcon, SearchIcon } from "lucide-react";
import { useCallback, useState } from "react";
import { github, type Repo } from "shared/lib/github";

export const ReposSearch = withConvex(() => {
  const { t } = useI18n();
  const [open, setOpen] = useState(false);

  useKeyDown(
    (e) => e.key === "k" && (e.ctrlKey || e.metaKey),
    () => setOpen(true)
  );

  const searchRepos = useCallback(async (searchQuery: string) => {
    const { repos } = await github.listRepos({
      query: searchQuery,
      minStars: 0,
      limit: 10
    });

    return repos;
  }, []);

  const {
    data: repos,
    isLoading,
    query,
    hasQuery,
    error,
    setQuery
  } = useAsyncSearch(searchRepos, {
    debounceMs: 700
  });

  const handleSelectRepo = async (repo: Repo) => {
    setOpen(false);
    await navigate(`/${repo.ownerLogin}/${repo.name}`);
  };

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
        <Command loop shouldFilter={false}>
          <CommandInput
            value={query}
            onValueChange={setQuery}
            placeholder={t("pages.home.repos.search-placeholder")}
          />

          <CommandList>
            {isLoading && !error && !repos?.length && (
              <div className="flex items-center justify-center p-4">
                <Spinner />
              </div>
            )}

            {error && (
              <CommandGroup>
                <Alert variant="destructive">
                  <AlertCircleIcon />
                  <AlertTitle>{t("pages.home.repos.search-error")}</AlertTitle>
                  <AlertDescription>
                    {t("pages.home.repos.search-error-description")}
                  </AlertDescription>
                </Alert>
              </CommandGroup>
            )}

            {!error && (
              <>
                {!isLoading && (
                  <CommandEmpty>
                    {hasQuery ? t("pages.home.repos.empty") : t("pages.home.repos.search-hint")}
                  </CommandEmpty>
                )}

                <CommandGroup>
                  {repos?.map((repo) => (
                    <CommandItem
                      key={repo.id}
                      value={`${repo.ownerLogin ? `${repo.ownerLogin}/` : ""}${repo.name}`}
                      onSelect={() => handleSelectRepo(repo)}
                    >
                      <div className="flex items-start gap-2">
                        <Avatar size="sm">
                          <AvatarImage
                            src={repo.ownerAvatarUrl ?? undefined}
                            alt={repo.ownerLogin ?? repo.name}
                          />
                          <AvatarFallback>
                            {(repo.ownerLogin?.[0] ?? repo.name[0] ?? "?").toUpperCase()}
                          </AvatarFallback>
                        </Avatar>

                        <div className="flex flex-col gap-1">
                          <span className="text-sm font-medium">
                            {repo.ownerLogin ? `${repo.ownerLogin}/` : ""}
                            {repo.name}
                          </span>
                          <span className="text-muted-foreground text-xs">
                            {repo.description ?? t("pages.home.repos.no-description")}
                          </span>
                        </div>
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
