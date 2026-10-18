import { authClient } from "./authClient";

export const refreshSession = async () => {
  // bypass the cookie cache so the server reads fresh data from the DB
  await authClient.getSession({
    query: { disableCookieCache: true },
  });
  // force the useSession() atom to refetch and re-render subscribers
  authClient.$store.notify("$sessionSignal");
};
