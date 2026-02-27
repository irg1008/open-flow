import { Card, CardContent } from "@/components/ui/card";
import { CreemIcon } from "@/components/ui/svgs/creem";
import { GithubIcon } from "@/components/ui/svgs/github";
import { GitlabIcon } from "@/components/ui/svgs/gitlab";
import { PatreonIcon } from "@/components/ui/svgs/patreon";
import { PolarShIcon } from "@/components/ui/svgs/polarSh";
import { StripeIcon } from "@/components/ui/svgs/stripe";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { m } from "@/i18n/_generated/messages";
import { cn } from "@/lib/utils";
import { useRouter, useSearch } from "@tanstack/react-router";
import { ComponentType, useState } from "react";
import { GithubIntegration } from "../github/GithubIntegration";

type Integration = {
  name: string;
  label: string;
  icon: React.ReactNode;
  content?: ComponentType;
};

const ComingSoon = () => (
  <div className="text-muted-foreground rounded-md border border-dashed p-4 text-sm">
    {m.settings_integrations_coming_soon()}
  </div>
);

const integrations: Integration[] = [
  { name: "github", label: "Github", icon: <GithubIcon />, content: GithubIntegration },
  { name: "gitlab", label: "Gitlab", icon: <GitlabIcon />, content: ComingSoon },
  { name: "github-sponsors", label: "Github Sponsors", icon: <GithubIcon />, content: ComingSoon },
  { name: "polar", label: "Polar", icon: <PolarShIcon />, content: ComingSoon },
  { name: "stripe", label: "Stripe", icon: <StripeIcon />, content: ComingSoon },
  { name: "creem", label: "Creem", icon: <CreemIcon />, content: ComingSoon },
  { name: "patreon", label: "Patreon", icon: <PatreonIcon />, content: ComingSoon }
];

export function IntegrationsSettings() {
  const search = useSearch({ from: "/_authed/_settings/settings/integrations" });
  const router = useRouter();

  const [activeTab, setActiveTab] = useState(search.tab ?? integrations[0].name);
  const [visitedTabs, setVisitedTabs] = useState<Set<string>>(new Set([activeTab]));

  const handleTabChange = async (value: string) => {
    setActiveTab(value);
    setVisitedTabs((prev) => new Set(prev).add(value));

    await router.navigate({ to: ".", search: (prev) => ({ ...prev, tab: value }) });
  };

  return (
    <Card>
      <CardContent className="space-y-4">
        <h2 className="font-medium">{m.settings_integrations_list_title()}</h2>
        <Tabs className="mt-4" value={activeTab} onValueChange={handleTabChange}>
          <TabsList loop className="w-full items-start justify-start overflow-x-auto">
            {integrations.map((integration) => (
              <TabsTrigger key={integration.name} value={integration.name}>
                {integration.icon}
                {integration.label}
              </TabsTrigger>
            ))}
          </TabsList>

          {integrations.map(
            ({ name, content: Content }) =>
              visitedTabs.has(name) && (
                <TabsContent
                  key={name}
                  value={name}
                  forceMount
                  className={cn("mt-4 space-y-4", name !== activeTab && "hidden")}
                >
                  {Content ? <Content /> : <ComingSoon />}
                </TabsContent>
              )
          )}
        </Tabs>
      </CardContent>
    </Card>
  );
}
