import { QueryClient } from "@tanstack/react-query";

export function getContext() {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: {
        staleTime: 1000 * 60 * 15,
        gcTime: 1000 * 60 * 60 * 30,
        retry: 1,
        refetchOnWindowFocus: false,
      },
    },
  });

  return {
    queryClient,
  };
}
export default function TanstackQueryProvider() {}
