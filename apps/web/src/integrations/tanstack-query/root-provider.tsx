import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

export function getContext() {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: {
        staleTime: 1000 * 60 * 15,
        gcTime: 1000 * 60 * 60 * 30,
        retry: 3,
        refetchOnWindowFocus: false,
      },
    },
  });

  return {
    queryClient,
  };
}
export default function TanstackQueryProvider({
  children,
  queryClient,
}: Readonly<{
  children: React.ReactNode;
  queryClient: QueryClient;
}>) {
  return (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );
}
