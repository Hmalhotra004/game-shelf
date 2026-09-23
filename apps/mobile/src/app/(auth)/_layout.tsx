import { useSession } from "@/hooks/useSession";
import { Redirect, Stack } from "expo-router";

export default function AuthLayout() {
  const { session, isPending } = useSession();

  if (isPending) return null;

  if (session) return <Redirect href={{ pathname: "/(tabs)" }} />;

  return (
    <Stack
      screenOptions={{
        headerShown: false,
        animation: "slide_from_right",
      }}
    />
  );
}
