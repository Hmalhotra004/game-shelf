import { authClient } from "./authClient";

export async function verifySession() {
  const session = await authClient.getSession();

  return session.data;
}
