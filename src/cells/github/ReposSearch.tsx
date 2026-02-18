"use client";

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
import { useKeyDown } from "@/hooks/use-key-down";
import { useSearch, UseSearchResult } from "@/hooks/use-search";
import { useI18n } from "@/i18n/client";
import { useNavigate } from "@tanstack/react-router";
import { AlertCircleIcon, SearchIcon } from "lucide-react";
import { useCallback, useState } from "react";
import { github, type Repo } from "shared/lib/github";

export const ReposSearch = () => {
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

  const results = useSearch({
    searchKey: "searchRepos",
    searchFn: searchRepos,
    debounceMs: 700
  });

  return (
    <>
      <InputGroup className="cursor-text" onClick={() => setOpen(true)}>
        <InputGroupAddon align="inline-start">
          <SearchIcon className="size-4" />
        </InputGroupAddon>
        <InputGroupInput
          value={results.query}
          readOnly
          placeholder={t("pages.home.repos.search-placeholder")}
          onFocus={() => setOpen(true)}
        />
      </InputGroup>

      <CommandDialog open={open} onOpenChange={setOpen} showCloseButton={false}>
        <Command loop shouldFilter={false}>
          <CommandInput
            value={results.query}
            onValueChange={results.setQuery}
            placeholder={t("pages.home.repos.search-placeholder")}
          />

          <CommandList>
            <ReposSearchResult result={results} />
          </CommandList>
        </Command>
      </CommandDialog>
    </>
  );
};

type ReposSearchResultProps = {
  result: UseSearchResult<Repo>;
};

const ReposSearchResult = ({ result }: ReposSearchResultProps) => {
  const { t } = useI18n();
  const navigate = useNavigate();

  if (result.error) {
    return (
      <CommandGroup>
        <Alert variant="destructive">
          <AlertCircleIcon />
          <AlertTitle>{t("pages.home.repos.search-error")}</AlertTitle>
          <AlertDescription>{t("pages.home.repos.search-error-description")}</AlertDescription>
        </Alert>
      </CommandGroup>
    );
  }

  const handleSelectRepo = async (repo: Repo) => {
    await navigate({ to: `/${repo.ownerLogin}/${repo.name}` });
  };

  if (result.data?.length) {
    return (
      <CommandGroup>
        {result.data.map((repo) => (
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
    );
  }

  if (!result.query) {
    return <CommandEmpty>{t("pages.home.repos.search-hint")}</CommandEmpty>;
  }

  if (result.isLoading || result.isFetching) {
    return (
      <div className="flex items-center justify-center p-4">
        <Spinner />
      </div>
    );
  }

  return <CommandEmpty>{t("pages.home.repos.empty")}</CommandEmpty>;
};
