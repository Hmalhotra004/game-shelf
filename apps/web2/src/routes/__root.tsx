import { ThemeProvider } from "#/components/ThemeProvider";
import { TooltipProvider } from "@/components/ui/tooltip";
import TanStackQueryDevtools from "@/integrations/tanstack-query/devtools";
import { TanStackDevtools } from "@tanstack/react-devtools";
import type { QueryClient } from "@tanstack/react-query";
import { TanStackRouterDevtoolsPanel } from "@tanstack/react-router-devtools";
import { NuqsAdapter } from "nuqs/adapters/tanstack-router";

import {
  HeadContent,
  Scripts,
  createRootRouteWithContext,
} from "@tanstack/react-router";

import appCss from "../globals.css?url";

interface MyRouterContext {
  queryClient: QueryClient;
}

export const Route = createRootRouteWithContext<MyRouterContext>()({
  head: () => ({
    meta: [
      {
        charSet: "utf-8",
      },
      {
        name: "viewport",
        content: "width=device-width, initial-scale=1",
      },
      {
        title: "Game Shelf",
      },
    ],
    links: [
      {
        rel: "preconnect",
        href: "https://fonts.googleapis.com",
      },
      {
        rel: "preconnect",
        href: "https://fonts.gstatic.com",
        crossOrigin: "anonymous",
      },
      {
        rel: "stylesheet",
        href: "https://fonts.googleapis.com/css2?family=Poppins:wght@300;400;500;600;700&display=swap",
      },
      {
        rel: "stylesheet",
        href: appCss,
      },
    ],
  }),
  shellComponent: RootDocument,
});

function RootDocument({ children }: { children: React.ReactNode }) {
  return (
    <html
      lang="en"
      suppressHydrationWarning
    >
      <head>
        <HeadContent />
      </head>

      <body className="font-sans antialiased wrap-anywhere">
        <NuqsAdapter>
          <ThemeProvider>
            <TooltipProvider>{children}</TooltipProvider>
          </ThemeProvider>
        </NuqsAdapter>

        <TanStackDevtools
          config={{
            position: "bottom-right",
          }}
          plugins={[
            {
              name: "Tanstack Router",
              render: <TanStackRouterDevtoolsPanel />,
            },
            TanStackQueryDevtools,
          ]}
        />

        <Scripts />
      </body>
    </html>
  );
}
