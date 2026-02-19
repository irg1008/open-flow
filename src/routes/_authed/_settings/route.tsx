import { SettingsSidebar } from "@/components/settings-sidebar";
import { m } from "@/i18n/_generated/messages";
import { seo } from "@/lib/seo";
import { createFileRoute, Outlet } from "@tanstack/react-router";

export const Route = createFileRoute("/_authed/_settings")({
  head: () => ({
    meta: seo({
      title: m.settings_meta_title(),
      description: m.settings_meta_description(),
      keywords: m.settings_meta_keywords()
    })
  }),
  component: RouteComponent
});

function RouteComponent() {
  return (
    <SettingsSidebar>
      <Outlet />
    </SettingsSidebar>
  );
}
