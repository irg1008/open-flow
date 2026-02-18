import { AccountSettings } from "@/cells/settings/AccountSettings";
import { SettingsSidebar } from "@/components/settings-sidebar";
import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/_authed/settings/account")({
  component: AccountPage
});

function AccountPage() {
  return (
    <SettingsSidebar currentPath="/settings/account">
      <AccountSettings />
    </SettingsSidebar>
  );
}
