import { createRootRouteWithContext, Outlet } from "@tanstack/react-router";

import type { QueryClient } from "@tanstack/react-query";

interface MyRouterContext {
  queryClient: QueryClient;
}

export const Route = createRootRouteWithContext<MyRouterContext>()({
  component: RootComponent,
});

function RootComponent() {
  // const router = useRouter();

  return (
    <>
      <Outlet />

      {/* <ErrorBoundary fallback={null}>
        <TanStackDevtools
          config={{ position: "top-left" }}
          plugins={[
            {
              name: "Tanstack Router",
              render: <TanStackRouterDevtoolsPanel router={router} />,
            },
            TanStackQueryDevtools,
          ]}
        />
      </ErrorBoundary> */}
    </>
  );
}
