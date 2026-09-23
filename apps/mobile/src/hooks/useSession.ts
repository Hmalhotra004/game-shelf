import { authClient } from "@/lib/authClient";

export const useSession = () => {
  const { data, isPending, error } = authClient.useSession();

  return { session: data, isPending, error };
};
