import { CodyPoorRich } from "@/components/imgs/cody-poor-rich";
import { RepoList } from "@/features/github/RepoList";
import { ReposSearch } from "@/features/github/ReposSearch";
import { m } from "@/i18n/_generated/messages";
import { seo } from "@/lib/seo";
import { createFileRoute } from "@tanstack/react-router";
import { RepoListsNames } from "shared/lib/github";

export const Route = createFileRoute("/")({
  component: IndexPage,
  head: () => ({
    meta: seo({
      title: m.pages_home_meta_title(),
      description: m.pages_home_meta_description(),
      keywords: m.pages_home_meta_keywords()
    })
  })
});

function IndexPage() {
  return (
    <>
      <section className="container flex flex-col items-center gap-4 md:gap-12">
        <h1 className="font-display mt-[1lh] text-center text-[clamp(2rem,10vw,6rem)] leading-none font-bold text-balance">
          {m.pages_home_heading()}
        </h1>

        <CodyPoorRich className="mx-auto h-64 max-w-full" />

        <div className="mt-2 w-full max-w-3xl">
          <ReposSearch />
        </div>
      </section>

      <section className="container mt-20 flex flex-wrap justify-center gap-6">
        <RepoList name={RepoListsNames.AllTime} title={m.repos_list_all_time_title()} />
        <RepoList name={RepoListsNames.LastMonth} title={m.repos_list_last_month_title()} />
      </section>
    </>
  );
}
