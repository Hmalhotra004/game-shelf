import { TooltipProvider } from "@/components/ui/tooltip";
import { RouterProvider, createRouter } from "@tanstack/react-router";
import { NuqsAdapter } from "nuqs/adapters/tanstack-router";
import { StrictMode } from "react";
import ReactDOM from "react-dom/client";
import { ThemeProvider } from "./components/ThemeProvider.tsx";
import { AppToaster } from "./components/ui/app-toaster.tsx";

import * as TanStackQueryProvider from "./integrations/tanstack-query/root-provider.tsx";

// Import the generated route tree
import { routeTree } from "./routeTree.gen";

import "./globals.css";

// Create a new router instance
const TanStackQueryProviderContext = TanStackQueryProvider.getContext();

const router = createRouter({
  routeTree,
  context: { ...TanStackQueryProviderContext },
  defaultPreload: "intent",
  scrollRestoration: true,
  defaultStructuralSharing: true,
  defaultPreloadStaleTime: 0,
});

// Register the router instance for type safety
declare module "@tanstack/react-router" {
  interface Register {
    router: typeof router;
  }
}

// Render the app
const rootElement = document.getElementById("root")!;
if (!rootElement.innerHTML) {
  const root = ReactDOM.createRoot(rootElement);
  root.render(
    <StrictMode>
      <NuqsAdapter>
        <ThemeProvider>
          <TooltipProvider>
            <TanStackQueryProvider.Provider {...TanStackQueryProviderContext}>
              <AppToaster />
              <RouterProvider router={router} />
            </TanStackQueryProvider.Provider>
          </TooltipProvider>
        </ThemeProvider>
      </NuqsAdapter>
    </StrictMode>,
  );
}
