import { ReposSearch } from "@/cells/github/ReposSearch";
import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/")({
  component: IndexPage
});

function IndexPage() {
  return <ReposSearch />;
}
