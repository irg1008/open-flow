import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarHeader,
  SidebarInset,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarProvider,
  SidebarTrigger
} from "@/components/ui/sidebar";
import { useI18n } from "@/i18n/client";
import { Link } from "@tanstack/react-router";
import type { PropsWithChildren } from "react";

type SettingsSidebarProps = {
  currentPath: string;
};

type SettingsLink = {
  href: string;
  label: string;
};

export function SettingsSidebar({
  currentPath,
  children
}: PropsWithChildren<SettingsSidebarProps>) {
  const { t } = useI18n();

  const links: SettingsLink[] = [
    { href: "/settings/account", label: t("pages.settings.account.title") },
    { href: "/settings/integrations", label: t("pages.settings.integrations.title") }
  ];

  return (
    <SidebarProvider
      style={
        {
          "--sidebar-width": "calc(var(--spacing) * 72)"
        } as React.CSSProperties
      }
    >
      <Sidebar collapsible="offcanvas" className="md:pt-(--header-height)">
        <SidebarHeader>
          <h2 className="mt-4 px-2 text-sm font-semibold">{t("pages.settings.title")}</h2>
        </SidebarHeader>

        <SidebarContent>
          <SidebarGroup>
            <SidebarGroupContent>
              <SidebarMenu>
                {links.map((link) => (
                  <SidebarMenuItem key={link.href}>
                    <SidebarMenuButton asChild isActive={currentPath === link.href}>
                      <Link to={link.href}>{link.label}</Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                ))}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        </SidebarContent>
      </Sidebar>

      <SidebarInset className="flex flex-col gap-4 p-4">
        <div className="flex w-full items-center gap-1 lg:gap-2">
          <SidebarTrigger className="-ml-1" />

          <h1 className="text-base font-medium">
            {links.find((link) => link.href === currentPath)?.label}
          </h1>
        </div>

        {children}
      </SidebarInset>
    </SidebarProvider>
  );
}
