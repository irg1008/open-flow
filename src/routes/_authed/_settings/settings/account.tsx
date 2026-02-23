import { AccountSettings } from "@/features/settings/AccountSettings";
import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/_authed/_settings/settings/account")({
  component: AccountSettings
});
