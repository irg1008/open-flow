import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarInset,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarProvider,
  SidebarTrigger
} from "@/components/ui/sidebar";
import { m } from "@/i18n/_generated/messages";
import { Link, ToPathOption, useLocation } from "@tanstack/react-router";
import { ExternalLinkIcon, UserIcon } from "lucide-react";
import type { PropsWithChildren } from "react";

type SettingsLink = {
  pathname: ToPathOption;
  label: string;
  icon?: React.ReactNode;
};

export function SettingsSidebar({ children }: PropsWithChildren) {
  const location = useLocation();

  const links: SettingsLink[] = [
    {
      pathname: "/settings/integrations",
      label: m.settings_integrations_title(),
      icon: <ExternalLinkIcon size={16} />
    },
    {
      pathname: "/settings/account",
      label: m.settings_account_title(),
      icon: <UserIcon size={16} />
    }
  ];

  return (
    <SidebarProvider
      style={
        {
          "--sidebar-width": "calc(var(--spacing) * 72)"
        } as React.CSSProperties
      }
    >
      <Sidebar collapsible="icon" className="md:pt-(--header-height)">
        <SidebarContent>
          <SidebarGroup>
            <SidebarGroupLabel>{m.settings_title()}</SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                {links.map((link) => (
                  <SidebarMenuItem key={link.pathname}>
                    <SidebarMenuButton asChild isActive={location.pathname === link.pathname}>
                      <Link to={link.pathname} className="flex items-center gap-2">
                        {link.icon}
                        {link.label}
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                ))}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        </SidebarContent>
      </Sidebar>

      <SidebarInset className="pb-4">
        <header className="flex w-full items-center gap-1 p-4 lg:gap-2">
          <SidebarTrigger className="-ml-1" />

          <h1 className="text-base font-medium">
            {links.find((link) => link.pathname === location.pathname)?.label}
          </h1>
        </header>

        <div className="container">{children}</div>
      </SidebarInset>
    </SidebarProvider>
  );
}
