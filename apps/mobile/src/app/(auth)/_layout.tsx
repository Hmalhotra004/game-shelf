import { useSession } from "@/hooks/useSession";
import { Redirect, Stack, useSegments } from "expo-router";

export default function AuthLayout() {
  const { session, isPending } = useSession();
  const segments = useSegments();

  if (isPending) return null;

  if (session?.user.emailVerified)
    return <Redirect href={{ pathname: "/(tabs)" }} />;

  const onVerifyScreen = segments[segments.length - 1] === "email-verification";

  if (session && !onVerifyScreen)
    return <Redirect href={{ pathname: "/(auth)/email-verification" }} />;

  return (
    <Stack
      screenOptions={{
        headerShown: false,
        animation: "slide_from_right",
      }}
    />
  );
}
