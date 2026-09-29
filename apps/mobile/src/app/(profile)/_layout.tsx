import { useSession } from "@/hooks/useSession";
import { Redirect, Stack } from "expo-router";

export default function ProfileLayout() {
  const { session, isPending } = useSession();

  if (isPending) return null;

  if (!session) return <Redirect href={{ pathname: "/(auth)" }} />;

  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen
        name="profile"
        options={{ animation: "slide_from_right" }}
      />
    </Stack>
  );
}
