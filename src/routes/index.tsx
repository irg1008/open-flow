import { ReposSearch } from "@/cells/github/ReposSearch";
import { m } from "@/i18n/_generated/messages";
import { seo } from "@/lib/seo";
import { createFileRoute } from "@tanstack/react-router";

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
  return <ReposSearch />;
}
