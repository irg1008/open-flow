/// <reference types="vite/client" />
import { Navbar } from "@/components/navbar";
import { TooltipProvider } from "@/components/ui/tooltip";
import { getLocale } from "@/i18n/_generated/runtime";
import { getAuth } from "@/lib/auth-server";
import { ConvexProvider } from "@/lib/convex";
import { seo } from "@/lib/seo";
import { getStoredTheme, ThemeScript } from "@/lib/theme";
import globalCss from "@/styles/global.css?url";
import { ConvexQueryClient } from "@convex-dev/react-query";
import { QueryClient } from "@tanstack/react-query";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import { createRootRouteWithContext, HeadContent, Outlet, Scripts } from "@tanstack/react-router";
import { TanStackRouterDevtools } from "@tanstack/react-router-devtools";
import * as React from "react";
import { Toaster } from "sonner";

export const Route = createRootRouteWithContext<{
  queryClient: QueryClient;
  convexQueryClient: ConvexQueryClient;
}>()({
  head: () => ({
    meta: [
      { charSet: "utf-8" },
      {
        name: "viewport",
        content: "width=device-width, initial-scale=1"
      },
      ...seo({ title: "Open Flow" })
    ],
    links: [
      { rel: "stylesheet", href: globalCss },
      { rel: "icon", href: "/favicon.ico" }
    ]
  }),
  loader: async () => ({
    initialTheme: await getStoredTheme()
  }),
  beforeLoad: async (ctx) => {
    const token = await getAuth();

    if (token) {
      ctx.context.convexQueryClient.serverHttpClient?.setAuth(token);
    }

    return { isAuthenticated: !!token, token };
  },
  component: RootComponent
});

function RootComponent() {
  return (
    <ConvexProvider from={Route.id}>
      <TooltipProvider>
        <RootDocument>
          <main className="bg-background relative flex min-h-svh flex-col">
            <Navbar />
            <div className="relative flex flex-1 flex-col p-4 has-[main]:p-0">
              <Outlet />
            </div>
          </main>

          <Toaster />
        </RootDocument>
      </TooltipProvider>
    </ConvexProvider>
  );
}

function RootDocument({ children }: { children: React.ReactNode }) {
  const { initialTheme } = Route.useLoaderData();
  const htmlClass = initialTheme === "system" ? undefined : initialTheme;

  return (
    <html lang={getLocale()} className={htmlClass} suppressHydrationWarning>
      <head>
        <HeadContent />
        <ThemeScript initialTheme={initialTheme} />
      </head>
      <body className="group/body overscroll-none antialiased [--footer-height:calc(var(--spacing)*14)] [--header-height:calc(var(--spacing)*14)] xl:[--footer-height:calc(var(--spacing)*24)]">
        {children}

        <ReactQueryDevtools />
        <TanStackRouterDevtools />

        <Scripts />
      </body>
    </html>
  );
}
