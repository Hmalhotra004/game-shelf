import { authClient } from "@/lib/authClient";
import { Redirect, Stack } from "expo-router";

export default function AuthLayout() {
  const { data, isPending } = authClient.useSession();

  if (isPending) return null;

  if (data?.user) {
    return <Redirect href="/(tabs)" />;
  }

  return <Stack />;
}
